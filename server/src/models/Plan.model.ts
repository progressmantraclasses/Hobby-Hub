import { Schema, model } from "mongoose";

const ChapterMetaSchema = new Schema({
  id: String,
  title: String,
  order: Number,
  summary: String,
  estimatedMinutes: Number,
  completed: { type: Boolean, default: false },
  contentGenerated: { type: Boolean, default: false },
}, { _id: false });

const PlanSchema = new Schema({
  hobby: { type: String, required: true },
  currentLevel: { type: String, required: true },
  targetLevel: { type: String, required: true },
  weeklyTimeHours: { type: Number, required: true },
  estimatedDurationWeeks: Number,
  overview: String,
  goal: String,
  chapters: [ChapterMetaSchema],
  normalizedQuery: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

export const Plan = model("Plan", PlanSchema);
