import Groq from "groq-sdk";
import { env } from "../config/env";
import { PlanRequestSchema, PlanSchema, type Plan } from "../schemas/plan.schema";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a structured learning plan generator.
Return ONLY a valid JSON object — no markdown, no extra text.
Shape:
{
  "hobby": string,
  "currentLevel": "beginner" | "intermediate",
  "targetLevel": "intermediate" | "advanced",
  "weeklyTimeHours": number,
  "estimatedDurationWeeks": number,
  "overview": string (2-3 sentences describing the learning journey),
  "goal": string (one line: what mastery looks like at the end),
  "chapters": [
    {
      "id": string (slug, e.g. "guitar-fundamentals"),
      "title": string,
      "order": number,
      "summary": string (2-3 sentences: what/why/expected outcome),
      "estimatedMinutes": number,
      "completed": false,
      "contentGenerated": false
    }
  ]
}
Rules:
- chapters must have 5-10 items
- Do NOT generate step-level content, only chapter titles/summaries/ordering
- order starts at 1 and increments sequentially
- estimatedDurationWeeks should account for weeklyTimeHours
- currentLevel maps: beginner->beginner, intermediate->intermediate, advanced->intermediate
- targetLevel is always one step above currentLevel`;

export async function generatePlan(input: unknown): Promise<Plan> {
  const { hobby, level, weeklyTime } = PlanRequestSchema.parse(input);

  const currentLevel = level === "advanced" ? "intermediate" : level as "beginner" | "intermediate";
  const targetLevel = currentLevel === "beginner" ? "intermediate" : "advanced";

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Hobby: ${hobby}\nCurrent level: ${currentLevel}\nTarget level: ${targetLevel}\nWeekly time: ${weeklyTime} hours`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  return PlanSchema.parse(JSON.parse(raw));
}
