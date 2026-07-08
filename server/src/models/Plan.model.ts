import { Schema, model } from "mongoose";

const TechniqueSchema = new Schema({
  title: String,
  why: String,
  resourceType: String,
  searchQuery: String,
  order: Number,
}, { _id: false });

const PlanSchema = new Schema({
  hobby: { type: String, required: true },
  level: { type: String, required: true },
  weeklyTime: { type: Number, required: true },
  normalizedQuery: { type: String, required: true, index: true },
  techniques: [TechniqueSchema],
  createdAt: { type: Date, default: Date.now },
});

export const Plan = model("Plan", PlanSchema);
