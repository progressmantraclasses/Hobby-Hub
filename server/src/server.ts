import { env } from "./config/env";
import { connectMongo } from "./config/mongo";
import { redis } from "./config/redis";
import { warmupSemanticCache } from "./services/semanticCache.service";
import { logger } from "./utils/logger";
import app from "./app";

async function start() {
  await connectMongo();
  await redis.ping();
  logger.info("Redis connected");
  await warmupSemanticCache();
  logger.info("Semantic cache model loaded");
  app.listen(Number(env.PORT), () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
}

start();
