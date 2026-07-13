import { env } from "./config/env";
import { connectMongo } from "./config/mongo";
import { redis } from "./config/redis";
import { warmupSemanticCache } from "./services/semanticCache.service";
import app from "./app";

async function start() {
  await connectMongo();
  await redis.ping();
  console.log("Redis connected");
  await warmupSemanticCache();
  console.log("Semantic cache model loaded");
  app.listen(Number(env.PORT), () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

start();
