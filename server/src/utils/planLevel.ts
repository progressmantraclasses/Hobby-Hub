// Shared by plan generation and the semantic-cache lookup: both need to agree on how
// "advanced" maps onto currentLevel, otherwise a cache lookup could silently miss plans
// that generation would have produced under the same request.
export function resolveCurrentLevel(level: string): string {
  return level === "advanced" ? "intermediate" : level;
}
