import path from "path";
import { pipeline, env as transformersEnv, type FeatureExtractionPipeline } from "@huggingface/transformers";
import { Plan } from "../models/Plan.model"
import { resolveCurrentLevel } from "../utils/planLevel";

transformersEnv.cacheDir = path.join(__dirname, "../../.model-cache/");

const MODEL_NAME = "onnx-community/all-MiniLM-L6-v2-ONNX";
// Tuned against real pairs run through this model — near-duplicate phrasings score
// 0.71-0.91 ("acoustic guitar lessons" / "guitar basics" ~0.71, "guitar" / "guitars" ~0.91,

const SIMILARITY_THRESHOLD = 0.90;

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", MODEL_NAME);
  }
  return extractorPromise;
}

export async function warmupSemanticCache(): Promise<void> {
  await getExtractor();
}

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
  const currentLevel = resolveCurrentLevel(level);

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
