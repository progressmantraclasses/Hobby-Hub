import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plan, PlanRequest } from '../schemas/plan.schema';

export type ChapterStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

interface PlanState extends Partial<PlanRequest> {
  plan: Plan | null;
  chapterProgress: Record<string, ChapterStatus>;
  setHobby: (hobby: string) => void;
  setLevel: (level: PlanRequest['level']) => void;
  setWeeklyTime: (time: number) => void;
  setPlan: (plan: Plan) => void;
  setChapterStatus: (id: string, status: ChapterStatus) => void;
  reset: () => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      hobby: undefined,
      level: undefined,
      weeklyTime: undefined,
      plan: null,
      chapterProgress: {},
      setHobby: (hobby) => set({ hobby }),
      setLevel: (level) => set({ level }),
      setWeeklyTime: (weeklyTime) => set({ weeklyTime }),
      setPlan: (plan) => set({ plan, chapterProgress: {} }),
      setChapterStatus: (id, status) =>
        set((state) => ({ chapterProgress: { ...state.chapterProgress, [id]: status } })),
      reset: () => set({ hobby: undefined, level: undefined, weeklyTime: undefined, plan: null, chapterProgress: {} }),
    }),
    { name: 'plan-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);
