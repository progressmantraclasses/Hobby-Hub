export const XP_PER_LEVEL = 200;
export const getLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const getXpProgress = (xp: number) => (xp % XP_PER_LEVEL) / XP_PER_LEVEL;

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
};

export const hobbyCompletion = (chapterProgress: Record<string, string>, chapters: { id: string }[]) => {
  if (!chapters.length) return 0;
  return chapters.filter(c => chapterProgress[c.id] === 'completed').length / chapters.length;
};
