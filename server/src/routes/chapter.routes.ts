import { Router } from "express";
import { chapterGenerateController } from "../controllers/chapter.controller";
import { rateLimiter } from "../middleware/rateLimiter.middleware";

const router = Router();

router.post("/plans/:planId/chapters/:chapterId/generate", rateLimiter, chapterGenerateController);

export default router;
