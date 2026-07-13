import { Schema, model } from "mongoose";

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

export const Plan = model("Plan", PlanSchema);
