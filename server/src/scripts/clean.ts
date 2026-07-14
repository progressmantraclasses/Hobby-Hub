import { connectMongo } from "../config/mongo";
import mongoose from "mongoose";
import { redis } from "../config/redis";

async function cleanDbs() {
  console.log("Cleaning databases...");
  
  // 1. Clean Redis
  await redis.flushdb();
  console.log("✅ Redis flushed");

  // 2. Clean Mongo
  await connectMongo();
  
  // We need to fetch collections explicitly since mongoose.connection.collections only lists initialized models
  const collections = await mongoose.connection.db?.collections();
  if (collections) {
    for (const collection of collections) {
      try {
        await collection.drop();
        console.log(`✅ Dropped MongoDB collection: ${collection.collectionName}`);
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes('ns not found')) {
           console.log(`✅ Collection ${collection.collectionName} was already empty/not found`);
        } else {
           console.error(`❌ Error dropping ${collection.collectionName}:`, e);
        }
      }
    }
  }
  
  console.log("All clean!");
  process.exit(0);
}

cleanDbs().catch(err => {
  console.error("Error cleaning databases:", err);
  process.exit(1);
});
