// Tiers are relative to maxXp (e.g. a course's total possible XP) so "Master" stays reachable
// regardless of how many chapters a specific course has, instead of a fixed absolute threshold.
export const RANK = (xp: number, maxXp: number) => {
  if (maxXp <= 0) return '🌱 Novice';
  const pct = xp / maxXp;
  return pct >= 1 ? '🏆 Master' : pct >= 0.625 ? '💎 Expert' : pct >= 0.25 ? '⭐ Scholar' : '🌱 Novice';
};
