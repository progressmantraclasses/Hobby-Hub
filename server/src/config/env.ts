import { z } from "zod";
import "dotenv/config";

const EnvSchema = z.object({
  PORT: z.string().min(1),
  MONGO_URI: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().min(1),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  GROQ_API_KEY: z.string().min(1),
  YOUTUBE_API_KEY: z.string().min(1),
});

function loadEnv() {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path[0]).join(", ");
    throw new Error(`Missing required environment variables: ${missing}`);
  }
  return result.data;
}

export const env = loadEnv();
