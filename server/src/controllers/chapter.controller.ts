import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Plan } from "../models/Plan.model";
import { ChapterContentSchema } from "../schemas/plan.schema";
import { generateChapterContent } from "../services/groq.service";

export async function chapterGenerateController(req: Request, res: Response, next: NextFunction) {
  const chapterId = req.params.chapterId as string;

  try {
    const planDoc = await Plan.findOne({ "chapters.id": chapterId });
    if (!planDoc) { res.status(404).json({ error: "Plan not found" }); return; }

    const chapter = planDoc.chapters.find((c: any) => c.id === chapterId);
    if (!chapter) { res.status(404).json({ error: "Chapter not found" }); return; }

    if (chapter.contentGenerated && chapter.steps) {
      res.json({ steps: chapter.steps });
      return;
    }

    const content = await generateChapterContent(
      planDoc.hobby as string, planDoc.currentLevel as string, chapter.title as string, chapter.summary as string
    );

    await Plan.updateOne(
      { "chapters.id": chapterId },
      { $set: { "chapters.$.steps": content.steps, "chapters.$.contentGenerated": true } }
    );

    res.json(content);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(500).json({ error: "AI returned invalid chapter content", details: err.flatten() });
      return;
    }
    next(err);
  }
}
