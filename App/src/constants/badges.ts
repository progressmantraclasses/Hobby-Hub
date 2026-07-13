export interface BadgeStats {
  totalChaptersDone: number;
  streak: number;
  xpTotal: number;
  hasFullyMastered: boolean;
}

export interface BadgeDef {
  id: string;
  icon: string;
  title: string;
  desc: string;
  isEarned: (stats: BadgeStats) => boolean;
}

export const BADGES: BadgeDef[] = [
  { id: 'first_chapter', icon: '📖', title: 'First Step',   desc: 'Complete your first chapter', isEarned: (s) => s.totalChaptersDone >= 1 },
  { id: 'streak_3',      icon: '🔥', title: '3-Day Streak', desc: 'Stay consistent for 3 days',  isEarned: (s) => s.streak >= 3 },
  { id: 'xp_100',        icon: '⚡', title: 'XP Hunter',    desc: 'Earn 100 XP total',           isEarned: (s) => s.xpTotal >= 100 },
  { id: 'xp_500',        icon: '💎', title: 'Dedicated',    desc: 'Earn 500 XP total',           isEarned: (s) => s.xpTotal >= 500 },
  { id: 'mastered',      icon: '🏆', title: 'Hobby Master', desc: 'Complete 100% of any hobby',  isEarned: (s) => s.hasFullyMastered },
];
