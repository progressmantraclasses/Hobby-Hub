import { Schema, model } from "mongoose";

const CachedVideoSchema = new Schema({
  videoId: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  thumbnailUrl: String,
  duration: String, // ISO 8601 string, e.g. PT15M30S
  viewCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  channelTitle: String,
  channelId: String,
  subscriberCount: { type: Number, default: 0 },
}, { _id: false });

const VideoCacheSchema = new Schema({
  queryNormalized: { type: String, required: true, index: true },
  videos: [CachedVideoSchema],
  fetchedAt: { type: Date, default: Date.now },
});

// TTL index set to expire documents after 7 days (604800 seconds)
VideoCacheSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 604800 });

export const VideoCache = model("VideoCache", VideoCacheSchema);
