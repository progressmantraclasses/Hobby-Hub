export const XP_PER_LEVEL = 200;
export const XP_PER_CHAPTER = 50;
export const getLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const getXpProgress = (xp: number) => (xp % XP_PER_LEVEL) / XP_PER_LEVEL;

export const greeting = () => {
  // getHours() inherently returns the local hour in 24-hour format (0-23)
  // regardless of whether the device is set to 12-hour or 24-hour display.
  const h = new Date().getHours();

  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 16) return 'Good afternoon';
  if (h >= 16 && h < 21) return 'Good evening';
  return 'Good night'; // For 9 PM to 4:59 AM
};

export const hobbyCompletion = (chapterProgress: Record<string, string>, chapters: { id: string }[]) => {
  if (!chapters.length) return 0;
  return chapters.filter(c => chapterProgress[c.id] === 'completed').length / chapters.length;
};
