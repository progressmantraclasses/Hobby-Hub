import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plan } from '../schemas/plan.schema';

export type ChapterStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

const STORE_VERSION = 2;

interface HobbyProgress {
  plan: Plan;
  chapterProgress: Record<string, ChapterStatus>;
}

interface PlanState {
  version: number;
  hobbies: Record<string, HobbyProgress>;
  activeHobbyId: string | null;
  xpTotal: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
  hobby?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  weeklyTime?: number;

  setHobby: (hobby: string) => void;
  setLevel: (level: 'beginner' | 'intermediate' | 'advanced') => void;
  setWeeklyTime: (time: number) => void;
  addHobby: (plan: Plan) => void;
  setActiveHobby: (hobbyId: string) => void;
  updateChapterProgress: (hobbyId: string, chapterId: string, status: ChapterStatus) => void;
  addXp: (amount: number) => void;
  reset: () => void;
}

const initialState = {
  version: STORE_VERSION,
  hobbies: {},
  activeHobbyId: null,
  xpTotal: 0,
  streak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  hobby: undefined,
  level: undefined,
  weeklyTime: undefined,
};

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      ...initialState,
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
      reset: () => set(initialState),
    }),
    {
      name: 'plan-storage-v2',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state && state.version !== STORE_VERSION) {
          console.log('[planStore] Version mismatch — clearing old storage');
          AsyncStorage.removeItem('plan-storage');
          Object.assign(state, initialState);
        }
      },
    }
  )
);

