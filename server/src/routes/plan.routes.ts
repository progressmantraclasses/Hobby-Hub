import { Router } from "express";
import { planController } from "../controllers/plan.controller";
import { rateLimiter } from "../middleware/rateLimiter.middleware";

const router = Router();

router.post("/generate-plan", rateLimiter, planController);

export default router;
