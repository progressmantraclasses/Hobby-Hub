import { PlanRequestSchema, PlanSchema, ChapterMetaSchema } from "../schemas/plan.schema";

const validChapter = (order: number) => ({
  id: `chapter-${order}`,
  title: `Chapter ${order}`,
  order,
  summary: "Learn the core concepts and apply them through guided exercises.",
  estimatedMinutes: 45,
  completed: false,
  contentGenerated: false,
});

const validPlan = (chapters: any[]) => ({
  hobby: "guitar",
  currentLevel: "beginner" as const,
  targetLevel: "intermediate" as const,
  weeklyTimeHours: 5,
  estimatedDurationWeeks: 8,
  overview: "This plan guides you from beginner to intermediate. You will build core skills step by step.",
  goal: "Play 3 full songs and improvise simple solos confidently.",
  chapters,
});

describe("PlanRequestSchema", () => {
  it("passes with valid input", () => {
    expect(PlanRequestSchema.safeParse({ hobby: "guitar", level: "beginner", weeklyTime: 5 }).success).toBe(true);
  });

  it("fails when hobby is missing", () => {
    expect(PlanRequestSchema.safeParse({ level: "beginner", weeklyTime: 5 }).success).toBe(false);
  });

  it("fails on invalid level enum value", () => {
    expect(PlanRequestSchema.safeParse({ hobby: "guitar", level: "expert", weeklyTime: 5 }).success).toBe(false);
  });
});

describe("ChapterMetaSchema", () => {
  it("passes with valid chapter", () => {
    expect(ChapterMetaSchema.safeParse(validChapter(1)).success).toBe(true);
  });

  it("fails when summary is missing", () => {
    const { summary, ...noSummary } = validChapter(1);
    expect(ChapterMetaSchema.safeParse(noSummary).success).toBe(false);
  });

  it("defaults completed and contentGenerated to false", () => {
    const result = ChapterMetaSchema.safeParse(validChapter(1));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completed).toBe(false);
      expect(result.data.contentGenerated).toBe(false);
    }
  });
});

describe("PlanSchema", () => {
  it("passes with 5-10 chapters", () => {
    const chapters = Array.from({ length: 7 }, (_, i) => validChapter(i + 1));
    expect(PlanSchema.safeParse(validPlan(chapters)).success).toBe(true);
  });

  it("fails with fewer than 5 chapters", () => {
    const chapters = Array.from({ length: 4 }, (_, i) => validChapter(i + 1));
    expect(PlanSchema.safeParse(validPlan(chapters)).success).toBe(false);
  });

  it("fails with more than 10 chapters", () => {
    const chapters = Array.from({ length: 12 }, (_, i) => validChapter(i + 1));
    expect(PlanSchema.safeParse(validPlan(chapters)).success).toBe(false);
  });

  it("fails when chapter summary is missing", () => {
    const chapters = Array.from({ length: 5 }, (_, i) => {
      const c = validChapter(i + 1);
      if (i === 0) return { ...c, summary: undefined };
      return c;
    });
    expect(PlanSchema.safeParse(validPlan(chapters)).success).toBe(false);
  });
});
