import { PlanRequest, Plan, PlanSchema, ChapterContentSchema, ChapterContent } from '../schemas/plan.schema';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android' ? 'http://192.168.1.34:5000/api' : 'http://192.168.1.34:5000/api';

export const generatePlan = async (request: PlanRequest): Promise<Plan> => {
  const response = await fetch(`${BASE_URL}/generate-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || err.error || 'Failed to generate plan');
  }

  const data = await response.json();
  const parsed = PlanSchema.safeParse(data);
  if (!parsed.success) throw new Error('Received invalid data from server');
  return parsed.data;
};

export const generateChapter = async (planId: string, chapterId: string): Promise<ChapterContent> => {
  const response = await fetch(`${BASE_URL}/plans/${planId}/chapters/${chapterId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || err.error || 'Failed to generate chapter content');
  }

  const data = await response.json();
  const parsed = ChapterContentSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Parse error on chapter data:", parsed.error);
    throw new Error('Received invalid chapter data from server');
  }
  return parsed.data;
};

