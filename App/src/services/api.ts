import { NativeModules, Platform } from 'react-native';
import { PlanRequest, Plan, PlanSchema, ChapterContentSchema, ChapterContent } from '../schemas/plan.schema';

const API_PORT = 5000;
const REQUEST_TIMEOUT_MS = 90000;

function getDevHost(): string {
  const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
  const match = scriptURL?.match(/^https?:\/\/([^/:]+)/);
  if (match) return match[1];
  return Platform.OS === 'android' ? '192.168.1.34' : 'localhost';
}

const BASE_URL = __DEV__
  ? `http://${getDevHost()}:${API_PORT}/api`
  : 'https://apis.codespirit.in/api';

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw new Error('Network error. Please check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }
}

export const generatePlan = async (request: PlanRequest): Promise<Plan> => {
  const response = await fetchWithTimeout(`${BASE_URL}/generate-plan`, {
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
  const response = await fetchWithTimeout(`${BASE_URL}/plans/${planId}/chapters/${chapterId}/generate`, {
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
