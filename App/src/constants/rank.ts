export const RANK = (xp: number) =>
  xp >= 800 ? '🏆 Master' : xp >= 500 ? '💎 Expert' : xp >= 200 ? '⭐ Scholar' : '🌱 Novice';
