import { Router } from "express";
import { getTechniqueVideo } from "../controllers/video.controller";
import { rateLimiter } from "../middleware/rateLimiter.middleware";

const router = Router();

router.get("/technique-video", rateLimiter, getTechniqueVideo);

export default router;
