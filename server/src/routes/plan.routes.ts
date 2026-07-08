import { Router } from "express";
import { planController } from "../controllers/plan.controller";

const router = Router();

router.post("/generate-plan", planController);

export default router;
