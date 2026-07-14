import { env } from "../config/env";
import { VideoCache } from "../models/VideoCache.model";

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  channelTitle: string;
  channelId: string;
  subscriberCount: number;
  score?: number;
}

export async function searchVideos(query: string): Promise<YouTubeVideo[]> {
  const queryNormalized = query.trim().toLowerCase();
  
  const cached = await VideoCache.findOne({ queryNormalized }).lean();
  if (cached) return cached.videos as YouTubeVideo[];

  // 1. search.list
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(queryNormalized)}&type=video&key=${env.YOUTUBE_API_KEY}`;
  const searchRes = await fetch(searchUrl);
  const searchData = (await searchRes.json()) as { items?: Array<{ id?: { videoId?: string }; snippet?: { channelId?: string } }>; error?: { message?: string } };
  if (!searchRes.ok) {
    throw new Error(`YouTube search.list failed: ${searchData.error?.message || searchRes.statusText}`);
  }
  const items = searchData.items || [];

  if (!items.length) return [];

  const videoIds = items.map((item) => item.id?.videoId).filter(Boolean);
  const channelIds = items.map((item) => item.snippet?.channelId).filter(Boolean);

  // 2. videos.list for stats & duration
  const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${videoIds.join(",")}&key=${env.YOUTUBE_API_KEY}`;
  const videosRes = await fetch(videosUrl);
  const videosData = (await videosRes.json()) as {
    items?: Array<{
      id: string;
      snippet?: { title?: string; description?: string; thumbnails?: { high?: { url?: string }; default?: { url?: string } }; channelTitle?: string; channelId?: string };
      contentDetails?: { duration?: string };
      statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
    }>;
    error?: { message?: string };
  };
  if (!videosRes.ok) {
    throw new Error(`YouTube videos.list failed: ${videosData.error?.message || videosRes.statusText}`);
  }
  const videoDetails = videosData.items || [];

  // 3. channels.list for subscriberCount
  const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${Array.from(new Set(channelIds)).join(",")}&key=${env.YOUTUBE_API_KEY}`;
  const channelsRes = await fetch(channelsUrl);
  const channelsData = (await channelsRes.json()) as { items?: Array<{ id: string; statistics?: { subscriberCount?: string } }>; error?: { message?: string } };
  if (!channelsRes.ok) {
    throw new Error(`YouTube channels.list failed: ${channelsData.error?.message || channelsRes.statusText}`);
  }
  const channelDetails = channelsData.items || [];

  const subsMap = new Map(
    channelDetails.map((c) => [c.id, Number(c.statistics?.subscriberCount || 0)])
  );

  const formattedVideos: YouTubeVideo[] = videoDetails.map((v) => {
    const stats = v.statistics || {};
    return {
      videoId: v.id,
      title: v.snippet?.title || "",
      description: v.snippet?.description || "",
      thumbnailUrl: v.snippet?.thumbnails?.high?.url || v.snippet?.thumbnails?.default?.url || "",
      duration: v.contentDetails?.duration || "PT0S",
      viewCount: Number(stats.viewCount || 0),
      likeCount: Number(stats.likeCount || 0),
      commentCount: Number(stats.commentCount || 0),
      channelTitle: v.snippet?.channelTitle || "",
      channelId: v.snippet?.channelId || "",
      subscriberCount: subsMap.get(v.snippet?.channelId || "") || 0,
    };
  });

  // Only cache a real result — caching an empty list here would permanently "poison" this
  // query for 7 days (the TTL below) even after a transient API failure clears up.
  if (formattedVideos.length) {
    await VideoCache.create({ queryNormalized, videos: formattedVideos });
  }
  return formattedVideos;
}
