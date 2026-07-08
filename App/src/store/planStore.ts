import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlanResponse, PlanRequest } from '../schemas/plan.schema';

interface PlanState extends Partial<PlanRequest> {
  plan: PlanResponse | null;
  techniqueStatus: Record<string, 'pending' | 'completed'>;
  setHobby: (hobby: string) => void;
  setLevel: (level: PlanRequest['level']) => void;
  setWeeklyTime: (time: number) => void;
  setPlan: (plan: PlanResponse) => void;
  updateTechniqueStatus: (title: string, status: 'pending' | 'completed') => void;
  reset: () => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      hobby: undefined,
      level: undefined,
      weeklyTime: undefined,
      plan: null,
      techniqueStatus: {},
      setHobby: (hobby) => set({ hobby }),
      setLevel: (level) => set({ level }),
      setWeeklyTime: (weeklyTime) => set({ weeklyTime }),
      setPlan: (plan) => set({ plan, techniqueStatus: {} }),
      updateTechniqueStatus: (title, status) =>
        set((state) => ({
          techniqueStatus: { ...state.techniqueStatus, [title]: status },
        })),
      reset: () => set({ hobby: undefined, level: undefined, weeklyTime: undefined, plan: null, techniqueStatus: {} }),
    }),
    {
      name: 'plan-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
