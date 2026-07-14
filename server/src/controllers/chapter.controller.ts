import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Plan } from "../models/Plan.model";
import { generateChapterContent } from "../services/groq.service";
import { searchVideos } from "../services/youtube.service";
import { filterCandidates, rankWithLLM } from "../services/videoFilter.service";
import type { ChapterContent, VideoStep } from "../schemas/plan.schema";
import { logger } from "../utils/logger";

const inFlightGenerations = new Map<string, Promise<ChapterContent>>();

async function resolveAndPersistChapter(
  planId: string,
  chapterId: string,
  hobby: string,
  level: string,
  title: string,
  summary: string
): Promise<ChapterContent> {
  const content = await generateChapterContent(hobby, level, title, summary);

  const videoStep = content.steps.find((s): s is VideoStep => s.type === "video");
  if (videoStep && videoStep.searchQueries?.length) {
    try {
      const query = videoStep.searchQueries[0] as string;

      const videos = await searchVideos(query);
      const candidates = filterCandidates(videos);
      const result = await rankWithLLM(candidates, query);
      if (result) {
        videoStep.video = result.video;
        videoStep.videoSummary = result.justification;
      }
    } catch (e) {
      logger.error("Failed to fetch video:", e);
    }
  }

  await Plan.updateOne(
    { _id: planId, "chapters.id": chapterId },
    { $set: { "chapters.$.steps": content.steps, "chapters.$.contentGenerated": true } }
  );

  return content;
}

export async function chapterGenerateController(req: Request, res: Response, next: NextFunction) {
  const { planId, chapterId } = req.params as { planId: string; chapterId: string };

  try {
    const planDoc = await Plan.findById(planId);
    if (!planDoc) { res.status(404).json({ error: "Plan not found" }); return; }

    const chapter = planDoc.chapters.find((c) => c.id === chapterId);
    if (!chapter) { res.status(404).json({ error: "Chapter not found" }); return; }

    if (chapter.contentGenerated && chapter.steps) {
      res.json({ steps: chapter.steps });
      return;
    }

    const key = `${planId}:${chapterId}`;
    let generation = inFlightGenerations.get(key);
    if (!generation) {
      generation = resolveAndPersistChapter(
        planId, chapterId, planDoc.hobby, planDoc.currentLevel, chapter.title, chapter.summary
      ).finally(() => inFlightGenerations.delete(key));
      inFlightGenerations.set(key, generation);
    }

    res.json(await generation);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(500).json({ error: "AI returned invalid chapter content", details: err.flatten() });
      return;
    }
    next(err);
  }
}
