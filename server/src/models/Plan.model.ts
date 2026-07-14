import { Schema, model, type Types } from "mongoose";
import type { ChapterContent } from "../schemas/plan.schema";

const ChapterMetaSchema = new Schema({
  id: String, title: String, order: Number, summary: String,
  estimatedMinutes: Number, completed: { type: Boolean, default: false },
  contentGenerated: { type: Boolean, default: false },
  steps: { type: Schema.Types.Mixed, default: null },
}, { _id: false });

const PlanSchema = new Schema({
  hobby: { type: String, required: true },
  currentLevel: String, targetLevel: String,
  weeklyTimeHours: Number, estimatedDurationWeeks: Number,
  overview: String, goal: String,
  chapters: [ChapterMetaSchema],
  normalizedQuery: { type: String, required: true, index: true },
  embedding: { type: [Number], default: undefined },
  createdAt: { type: Date, default: Date.now },
});

export interface PlanChapterDoc {
  id: string;
  title: string;
  order: number;
  summary: string;
  estimatedMinutes: number;
  completed: boolean;
  contentGenerated: boolean;
  steps: ChapterContent["steps"] | null;
}

export interface PlanDocument {
  _id: Types.ObjectId;
  hobby: string;
  currentLevel: string;
  targetLevel: string;
  weeklyTimeHours: number;
  estimatedDurationWeeks: number;
  overview: string;
  goal: string;
  chapters: PlanChapterDoc[];
  normalizedQuery: string;
  embedding?: number[];
  createdAt: Date;
}

export const Plan = model<PlanDocument>("Plan", PlanSchema);
