import Groq from "groq-sdk";
import { env } from "../config/env";
import { PlanRequestSchema, PlanResponseSchema, type PlanResponse } from "../schemas/plan.schema";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export class AIProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIProviderError";
  }
}

const SYSTEM_PROMPT = `You are a hobby learning plan generator.
Return ONLY a valid JSON object matching this exact shape — no markdown, no extra text:
{
  "techniques": [
    {
      "title": string,
      "why": string,
      "resourceType": "watch" | "read" | "interactive-drill" | "practice-checklist",
      "searchQuery": string,
      "order": number
    }
  ]
}
Rules:
- techniques array must have 5–8 items
- resourceType must be one of: watch, read, interactive-drill, practice-checklist
- order starts at 1 and increments sequentially
- searchQuery is a YouTube/Google search string for the technique`;

async function withTimeout<T>(promise: Promise<T>, ms = 10000): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Timeout")), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

export async function generatePlan(input: unknown): Promise<PlanResponse> {
  const { hobby, level, weeklyTime } = PlanRequestSchema.parse(input);

  const makeCall = () =>
    groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Hobby: ${hobby}\nLevel: ${level}\nWeekly time available: ${weeklyTime} hours`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

  let completion;
  try {
    completion = await withTimeout(makeCall());
  } catch (err) {
    try {
      console.warn("First Groq call failed/timed out. Retrying...");
      completion = await withTimeout(makeCall());
    } catch (retryErr) {
      throw new AIProviderError("Groq service is temporarily unavailable. Persistent failure after retry.");
    }
  }

  const raw = completion.choices[0]?.message?.content ?? "";
  return PlanResponseSchema.parse(JSON.parse(raw));
}
