export const RANK = (xp: number, maxXp: number) => {
  if (maxXp <= 0) return '🌱 Novice';
  const pct = xp / maxXp;
  return pct >= 1 ? '🏆 Master' : pct >= 0.625 ? '💎 Expert' : pct >= 0.25 ? '⭐ Scholar' : '🌱 Novice';
};
