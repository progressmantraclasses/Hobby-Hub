import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plan } from '../schemas/plan.schema';

export type ChapterStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

const STORE_VERSION = 3;

// Streak days must be counted against the device's local calendar day, not UTC —
// toISOString() would roll the date over at UTC midnight instead of the user's own midnight.
const toLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface HobbyProgress {
  plan: Plan;
  chapterProgress: Record<string, ChapterStatus>;
}

interface PlanState {
  version: number;
  hasHydrated: boolean;
  hobbies: Record<string, HobbyProgress>;
  activeHobbyId: string | null;
  xpTotal: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
  hobby?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  weeklyTime?: number;
  userName: string;

  setUserName: (name: string) => void;
  setHobby: (hobby: string) => void;
  setLevel: (level: 'beginner' | 'intermediate' | 'advanced') => void;
  setWeeklyTime: (time: number) => void;
  addHobby: (plan: Plan) => void;
  setActiveHobby: (hobbyId: string) => void;
  updateChapterProgress: (hobbyId: string, chapterId: string, status: ChapterStatus) => void;
  addXp: (amount: number) => void;
  updateStreak: () => void;
  reset: () => void;
}

const initialState = {
  version: STORE_VERSION,
  hasHydrated: false,
  hobbies: {},
  activeHobbyId: null,
  xpTotal: 0,
  streak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  hobby: undefined,
  level: undefined,
  weeklyTime: undefined,
  userName: 'Explorer',
};

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      ...initialState,
      setUserName: (userName) => set({ userName }),
      setHobby: (hobby) => set({ hobby }),
      setLevel: (level) => set({ level }),
      setWeeklyTime: (weeklyTime) => set({ weeklyTime }),
      addHobby: (plan) =>
        set((state) => ({
          hobbies: { ...state.hobbies, [plan.hobby]: { plan, chapterProgress: {} } },
          activeHobbyId: plan.hobby,
        })),
      setActiveHobby: (hobbyId) => set({ activeHobbyId: hobbyId }),
      updateChapterProgress: (hobbyId, chapterId, status) =>
        set((state) => ({
          hobbies: {
            ...state.hobbies,
            [hobbyId]: {
              ...state.hobbies[hobbyId],
              chapterProgress: { ...state.hobbies[hobbyId]?.chapterProgress, [chapterId]: status },
            },
          },
        })),
      addXp: (amount) =>
        set((state) => {
          const next = state.xpTotal + amount;
          return { xpTotal: next };
        }),
      updateStreak: () =>
        set((state) => {
          const today = toLocalDateKey(new Date());
          const lastDate = state.lastActiveDate;
          let currentStreak = state.streak;
          let maxStreak = state.longestStreak || 0;

          if (lastDate === today) {
            return {};
          }

          const yesterday = toLocalDateKey(new Date(Date.now() - 86400000));
          if (lastDate === yesterday) {
            currentStreak += 1;
          } else {
            currentStreak = 1;
          }

          if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
          }

          return {
            streak: currentStreak,
            longestStreak: maxStreak,
            lastActiveDate: today,
          };
        }),
      reset: () => set({ ...initialState, hasHydrated: true }),
    }),
    {
      name: 'plan-storage-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        const persisted = { ...state };
        delete (persisted as { hasHydrated?: boolean }).hasHydrated;
        return persisted;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.version !== STORE_VERSION) {
          console.log('[planStore] Version mismatch — clearing old storage');
          AsyncStorage.removeItem('plan-storage-v2');
          Object.assign(state, initialState);
        }
        state.hasHydrated = true;
      },
    }
  )
);

