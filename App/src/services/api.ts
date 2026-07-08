import { PlanRequest, PlanResponse, PlanResponseSchema } from '../schemas/plan.schema';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2 instead of localhost
const BASE_URL = Platform.OS === 'android' ? 'http://192.168.1.34:5000/api' : 'http://localhost:5000/api';

export const generatePlan = async (request: PlanRequest): Promise<PlanResponse> => {
  const response = await fetch(`${BASE_URL}/generate-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to generate plan');
  }

  const data = await response.json();
  
  // Validate the response using Zod
  const parsedResponse = PlanResponseSchema.safeParse(data);

  if (!parsedResponse.success) {
    console.error('Invalid backend response:', parsedResponse.error);
    throw new Error('Received invalid data from server');
  }

  return parsedResponse.data;
};


