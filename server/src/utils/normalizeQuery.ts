export function normalizeQuery(hobby: string, level: string, weeklyTime: number) {
  return `${hobby.trim().toLowerCase()}:${level}:${weeklyTime}`;
}
