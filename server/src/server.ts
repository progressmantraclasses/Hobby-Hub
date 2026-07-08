import { env } from "./config/env";
import { connectMongo } from "./config/mongo";
import { redis } from "./config/redis";
import app from "./app";

async function start() {
  await connectMongo();
  await redis.ping();
  console.log("Redis connected");
  app.listen(Number(env.PORT), () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

start();
