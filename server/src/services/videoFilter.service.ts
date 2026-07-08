import Groq from "groq-sdk";
import { env } from "../config/env";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (
    parseInt(match[1] || "0", 10) * 3600 +
    parseInt(match[2] || "0", 10) * 60 +
    parseInt(match[3] || "0", 10)
  );
}

export function filterCandidates(videos: any[]): any[] {
  return videos
    .filter((video) => {
      const sec = parseDuration(video.duration);
      return sec >= 60 && sec <= 5400; // 1 min to 90 mins
    })
    .map((video) => {
      const engagement = video.viewCount > 0 ? (video.likeCount + video.commentCount) / video.viewCount : 0;
      const score = engagement * 100 + Math.log10(video.subscriberCount + 1);
      return { ...video, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

export async function rankWithLLM(candidates: any[], query: string) {
  if (!candidates.length) return null;

  const prompt = `Given the search query: "${query}"
Evaluate these candidates and select the single best video for learning:
${candidates.map((c, i) => `[Candidate ${i}] Title: "${c.title}" | Views: ${c.viewCount} | Channel: "${c.channelTitle}" | Desc: "${c.description.slice(0, 100)}"`).join("\n")}

Return a JSON object only:
{
  "bestIndex": number,
  "justification": "Why this video is the absolute best match for learning this topic."
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const res = JSON.parse(completion.choices[0]?.message?.content || "{}");
  const selected = candidates[res.bestIndex ?? 0] || candidates[0];

  return {
    video: selected,
    justification: res.justification || "Recommended based on engagement and channel quality.",
  };
}
