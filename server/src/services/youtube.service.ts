import { env } from "../config/env";
import { VideoCache } from "../models/VideoCache.model";

export async function searchVideos(query: string) {
  const queryNormalized = query.trim().toLowerCase();
  
  const cached = await VideoCache.findOne({ queryNormalized }).lean();
  if (cached) return cached.videos;

  // 1. search.list
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(queryNormalized)}&type=video&key=${env.YOUTUBE_API_KEY}`;
  const searchRes = await fetch(searchUrl);
  const searchData = (await searchRes.json()) as any;
  const items = searchData.items || [];
  
  if (!items.length) return [];

  const videoIds = items.map((item: any) => item.id.videoId).filter(Boolean);
  const channelIds = items.map((item: any) => item.snippet.channelId).filter(Boolean);

  // 2. videos.list for stats & duration
  const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${videoIds.join(",")}&key=${env.YOUTUBE_API_KEY}`;
  const videosRes = await fetch(videosUrl);
  const videosData = (await videosRes.json()) as any;
  const videoDetails = videosData.items || [];

  // 3. channels.list for subscriberCount
  const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${Array.from(new Set(channelIds)).join(",")}&key=${env.YOUTUBE_API_KEY}`;
  const channelsRes = await fetch(channelsUrl);
  const channelsData = (await channelsRes.json()) as any;
  const channelDetails = channelsData.items || [];

  const subsMap = new Map(
    channelDetails.map((c: any) => [c.id, Number(c.statistics?.subscriberCount || 0)])
  );

  const formattedVideos = videoDetails.map((v: any) => {
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
      subscriberCount: subsMap.get(v.snippet?.channelId) || 0,
    };
  });

  await VideoCache.create({ queryNormalized, videos: formattedVideos });
  return formattedVideos;
}
