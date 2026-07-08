import {
  PlanRequestSchema,
  PlanResponseSchema,
} from "../schemas/plan.schema";


const validTechnique = (order: number) => ({
  title: "Practice scales",
  why: "Builds muscle memory",
  resourceType: "video" as const,
  searchQuery: "guitar scales beginner",
  order,
});

describe("PlanRequestSchema", () => {
  it("passes with valid input", () => {
    const result = PlanRequestSchema.safeParse({
      hobby: "guitar",
      level: "beginner",
      weeklyTime: 5,
    });
    expect(result.success).toBe(true);
  });

  it("fails when hobby is missing", () => {
    const result = PlanRequestSchema.safeParse({
      level: "beginner",
      weeklyTime: 5,
    });
    expect(result.success).toBe(false);
  });

  it("fails on invalid level enum value", () => {
    const result = PlanRequestSchema.safeParse({
      hobby: "guitar",
      level: "expert",
      weeklyTime: 5,
    });
    expect(result.success).toBe(false);
  });
});

describe("PlanResponseSchema", () => {
  it("fails when techniques array length is below minimum (3)", () => {
    const result = PlanResponseSchema.safeParse({
      techniques: [
        validTechnique(1),
        validTechnique(2),
        validTechnique(3),
      ],
    });
    expect(result.success).toBe(false);
  });

  it("passes with 6 techniques and valid resourceType values", () => {
    const resourceTypes = [
      "video",
      "article",
      "book",
      "course",
      "video",
      "article",
    ] as const;

    const result = PlanResponseSchema.safeParse({
      techniques: resourceTypes.map((resourceType, i) => ({
        ...validTechnique(i + 1),
        resourceType,
      })),
    });
    expect(result.success).toBe(true);
  });
});
