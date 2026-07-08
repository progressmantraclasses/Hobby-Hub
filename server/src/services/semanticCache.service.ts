import { Plan } from "../models/Plan.model";

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * (vecB[i] ?? 0), 0);
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return magA && magB ? dotProduct / (magA * magB) : 0;
}

export async function findSimilarPlan(normalizedQuery: string) {
  // TODO: Implement embedding generation using your preferred provider (e.g. OpenAI, HuggingFace, etc.)
  const queryEmbedding: number[] | null = null; 

  if (!queryEmbedding) return null;

  // TODO: Define your cosine similarity threshold (e.g., 0.85)
  const THRESHOLD = 0.85;

  const plans = await Plan.find({ embedding: { $exists: true } }).lean();

  for (const plan of plans) {
    // Assuming plan has an embedding field of type number[]
    const planEmbedding = (plan as any).embedding as number[] | undefined;
    if (!planEmbedding) continue;

    const similarity = cosineSimilarity(queryEmbedding, planEmbedding);
    if (similarity >= THRESHOLD) {
      return plan;
    }
  }

  return null;
}
