import { ChapterContentSchema, PlanRequestSchema, PlanSchema, ChapterMetaSchema } from "../schemas/plan.schema";

const validChapter = (order: number) => ({
  id: `chapter-${order}`, title: `Chapter ${order}`, order,
  summary: "Learn the core concepts and apply them through guided exercises.",
  estimatedMinutes: 45, completed: false, contentGenerated: false,
});

const validPlan = (chapters: Record<string, unknown>[]) => ({
  id: "plan-1",
  hobby: "guitar", currentLevel: "beginner" as const, targetLevel: "intermediate" as const,
  weeklyTimeHours: 5, estimatedDurationWeeks: 8,
  overview: "This plan guides you from beginner to intermediate through structured chapters.",
  goal: "Play 3 full songs and improvise simple solos confidently.",
  chapters,
});

const validContent = () => ({
  steps: [
    { type: "summary", whatYouWillLearn: ["Basics"], keyConcepts: ["Chords"], expectedOutcome: "Understand fundamentals" },
    { type: "video", searchQueries: ["guitar basics for beginners"] },
    { type: "reflection", question: "What is a chord?", format: "shortAnswer", correctAnswer: "A group of notes played together" },
    { type: "reading", content: "A chord is formed by playing multiple notes simultaneously. ".repeat(30), tips: ["Practice slowly"], commonMistakes: ["Rushing"], imagePrompts: ["guitar chord diagram"] },
    { type: "interactive", activityType: "flashcard", cards: [{ front: "C Major", back: "C E G" }] },
    { type: "quiz", passingScore: 70, questions: Array.from({ length: 5 }, (_, i) => ({ question: `Q${i+1}?`, type: "mcq", options: ["A","B","C","D"], correctAnswer: "A" })) },
    { type: "practice", task: "Practice C major chord transitions", expectedOutcome: "Smooth transitions", suggestedMinutes: 15 },
  ],
});

describe("PlanRequestSchema", () => {
  it("passes with valid input", () => expect(PlanRequestSchema.safeParse({ hobby: "guitar", level: "beginner", weeklyTime: 5 }).success).toBe(true));
  it("fails when hobby is missing", () => expect(PlanRequestSchema.safeParse({ level: "beginner", weeklyTime: 5 }).success).toBe(false));
  it("fails on invalid level", () => expect(PlanRequestSchema.safeParse({ hobby: "guitar", level: "expert", weeklyTime: 5 }).success).toBe(false));
});

describe("ChapterMetaSchema", () => {
  it("passes with valid chapter", () => expect(ChapterMetaSchema.safeParse(validChapter(1)).success).toBe(true));
  it("fails when summary is missing", () => {
    const chapter = validChapter(1) as Record<string, unknown>;
    delete chapter.summary;
    expect(ChapterMetaSchema.safeParse(chapter).success).toBe(false);
  });
  it("defaults completed/contentGenerated to false", () => {
    const r = ChapterMetaSchema.safeParse(validChapter(1));
    expect(r.success && r.data.completed).toBe(false);
    expect(r.success && r.data.contentGenerated).toBe(false);
  });
  it("coerces string order/estimatedMinutes to numbers", () => {
    const chapter = { ...validChapter(1), order: "1", estimatedMinutes: "45" };
    const r = ChapterMetaSchema.safeParse(chapter);
    expect(r.success).toBe(true);
    expect(r.success && r.data.order).toBe(1);
    expect(r.success && r.data.estimatedMinutes).toBe(45);
  });
  it("falls back to false when completed/contentGenerated isn't a real boolean", () => {
    const chapter = { ...validChapter(1), completed: "false", contentGenerated: "true" };
    const r = ChapterMetaSchema.safeParse(chapter);
    expect(r.success).toBe(true);
    expect(r.success && r.data.completed).toBe(false);
    expect(r.success && r.data.contentGenerated).toBe(false);
  });
});

describe("PlanSchema", () => {
  it("passes with 5-10 chapters", () => expect(PlanSchema.safeParse(validPlan(Array.from({ length: 7 }, (_, i) => validChapter(i+1)))).success).toBe(true));
  it("fails with fewer than 5 chapters", () => expect(PlanSchema.safeParse(validPlan(Array.from({ length: 4 }, (_, i) => validChapter(i+1)))).success).toBe(false));
  it("allows more than 10 chapters at the schema level (the service trims it)", () => expect(PlanSchema.safeParse(validPlan(Array.from({ length: 12 }, (_, i) => validChapter(i+1)))).success).toBe(true));
  it("fails when chapter summary is missing", () => {
    const chapters = Array.from({ length: 5 }, (_, i) => i === 0 ? { ...validChapter(1), summary: undefined } : validChapter(i+1));
    expect(PlanSchema.safeParse(validPlan(chapters as Record<string, unknown>[])).success).toBe(false);
  });
  it("falls back instead of failing on a bad currentLevel/targetLevel or a string weeklyTimeHours", () => {
    const chapters = Array.from({ length: 5 }, (_, i) => validChapter(i+1));
    const plan = { ...validPlan(chapters), currentLevel: "expert", targetLevel: "guru", weeklyTimeHours: "5" };
    const r = PlanSchema.safeParse(plan);
    expect(r.success).toBe(true);
    expect(r.success && r.data.weeklyTimeHours).toBe(5);
  });
});

describe("ChapterContentSchema", () => {
  it("passes with all 7 valid steps", () => expect(ChapterContentSchema.safeParse(validContent()).success).toBe(true));
  it("fails when a step is missing", () => {
    const { steps } = validContent();
    expect(ChapterContentSchema.safeParse({ steps: steps.slice(0, 6) }).success).toBe(false);
  });
  it("coerces an invalid quiz passingScore to 70 instead of failing", () => {
    const c = validContent();
    (c.steps[5] as { passingScore?: number }).passingScore = 80;
    const r = ChapterContentSchema.safeParse(c);
    expect(r.success).toBe(true);
    expect(r.success && (r.data.steps[5] as { passingScore: number }).passingScore).toBe(70);
  });
  it("allows more than 2 search queries at the schema level (the service trims it)", () => {
    const c = validContent();
    (c.steps[1] as { searchQueries?: string[] }).searchQueries = ["q1","q2","q3"];
    expect(ChapterContentSchema.safeParse(c).success).toBe(true);
  });
  it("passes with scenario interactive type", () => {
    const c = validContent();
    (c.steps[4] as Record<string, unknown>) = { type: "interactive", activityType: "scenario", situation: "You need to pick a chord", choices: ["C","G"], bestChoice: "C" };
    expect(ChapterContentSchema.safeParse(c).success).toBe(true);
  });
  it("coerces a wrong-case step type instead of failing", () => {
    const c = validContent();
    (c.steps[0] as { type?: string }).type = "Summary";
    const r = ChapterContentSchema.safeParse(c);
    expect(r.success).toBe(true);
    expect(r.success && r.data.steps[0].type).toBe("summary");
  });
  it("falls back to an empty flashcard when interactive data doesn't match any activityType", () => {
    const c = validContent();
    (c.steps[4] as Record<string, unknown>) = { type: "interactive", activityType: "flashcard", data: { cards: [{ front: "C Major", back: "C E G" }] } };
    const r = ChapterContentSchema.safeParse(c);
    expect(r.success).toBe(true);
    expect(r.success && r.data.steps[4]).toMatchObject({ activityType: "flashcard", cards: [] });
  });
  it("coerces a string suggestedMinutes to a number", () => {
    const c = validContent();
    (c.steps[6] as { suggestedMinutes?: unknown }).suggestedMinutes = "20";
    const r = ChapterContentSchema.safeParse(c);
    expect(r.success).toBe(true);
    expect(r.success && (r.data.steps[6] as { suggestedMinutes: number }).suggestedMinutes).toBe(20);
  });
  it("falls back to mcq on an unrecognized reflection format", () => {
    const c = validContent();
    (c.steps[2] as { format?: string }).format = "multiple_choice";
    const r = ChapterContentSchema.safeParse(c);
    expect(r.success).toBe(true);
    expect(r.success && (r.data.steps[2] as { format: string }).format).toBe("mcq");
  });
});
