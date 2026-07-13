import path from "path";
import { pipeline, env as transformersEnv, type FeatureExtractionPipeline } from "@huggingface/transformers";
import { Plan } from "../models/Plan.model";

// Default cache dir lives inside node_modules/@huggingface/transformers/.cache, which gets
// wiped on every fresh `npm install`/`npm ci` (every CI run, every redeploy without a
// persisted node_modules) — forcing a ~90MB re-download. Point it at a stable project-level
// directory instead (gitignored, since it's a large binary cache, not source).
transformersEnv.cacheDir = path.join(__dirname, "../../.model-cache/");

const MODEL_NAME = "onnx-community/all-MiniLM-L6-v2-ONNX";
// Tuned against real pairs run through this model — near-duplicate phrasings score
// 0.71-0.91 ("acoustic guitar lessons" / "guitar basics" ~0.71, "guitar" / "guitars" ~0.91,
// "yoga" / "yoga for beginners" ~0.79), while different-but-related hobbies stay lower
// ("guitar" / "piano" ~0.57, "python" / "javascript" ~0.31). 0.65 favors precision (avoiding
// false matches across genuinely different hobbies) over catching every possible near-dupe.
const SIMILARITY_THRESHOLD = 0.65;

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", MODEL_NAME);
  }
  return extractorPromise;
}

// Call once at server startup so the model is downloaded/loaded before the first request
// arrives, instead of making whichever user happens to hit the app first pay that latency.
export async function warmupSemanticCache(): Promise<void> {
  await getExtractor();
}

// Runs entirely locally (ONNX model, downloaded once and cached on disk) — no API key,
// no network call per request. Produces a real sentence embedding, unlike a lexical/hashing
// approximation, so it understands paraphrases that share no words in common.
export async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * (vecB[i] ?? 0), 0);
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return magA && magB ? dotProduct / (magA * magB) : 0;
}

export async function findSimilarPlan(queryEmbedding: number[], level: string, weeklyTime: number) {
  const currentLevel = level === "advanced" ? "intermediate" : level;

  const candidates = await Plan.find({
    currentLevel,
    weeklyTimeHours: weeklyTime,
    embedding: { $exists: true, $ne: [] },
  }).lean();

  let best: { plan: (typeof candidates)[number]; similarity: number } | null = null;
  for (const plan of candidates) {
    const planEmbedding = (plan as { embedding?: number[] }).embedding;
    if (!planEmbedding?.length) continue;

    const similarity = cosineSimilarity(queryEmbedding, planEmbedding);
    if (similarity >= SIMILARITY_THRESHOLD && (!best || similarity > best.similarity)) {
      best = { plan, similarity };
    }
  }

  return best?.plan ?? null;
}
