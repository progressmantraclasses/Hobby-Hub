import { PlanRequest, Plan, PlanSchema } from '../schemas/plan.schema';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android' ? 'http://192.168.1.34:5000/api' : 'http://localhost:5000/api';

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
