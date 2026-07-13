jest.mock("@huggingface/transformers", () => ({
  pipeline: jest.fn(),
  env: { cacheDir: null },
}));
jest.mock("../models/Plan.model", () => ({
  Plan: {
    find: jest.fn(),
  },
}));

import { pipeline } from "@huggingface/transformers";
import { cosineSimilarity, generateEmbedding, findSimilarPlan } from "../services/semanticCache.service";
import { Plan } from "../models/Plan.model";

describe("Semantic Cache Service", () => {
  describe("cosineSimilarity", () => {
    it("returns 1 for identical vectors", () => {
      expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1);
    });

    it("returns 0 for orthogonal vectors", () => {
      expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0);
    });

    it("returns correct similarity for arbitrary vectors", () => {
      expect(cosineSimilarity([3, 4, 0], [3, 4, 0])).toBeCloseTo(1);
      expect(cosineSimilarity([1, 2, 3], [4, 5, 6])).toBeCloseTo(0.97463);
    });
  });

  describe("generateEmbedding", () => {
    it("extracts a plain number array from the pipeline's tensor output, loading the pipeline only once across calls", async () => {
      const rawVector = new Float32Array([0.1, 0.2, 0.3]);
      const mockExtractor = jest.fn().mockResolvedValue({ data: rawVector });
      (pipeline as jest.Mock).mockResolvedValue(mockExtractor);

      const result = await generateEmbedding("guitar");
      await generateEmbedding("piano");

      expect(mockExtractor).toHaveBeenCalledWith("guitar", { pooling: "mean", normalize: true });
      expect(result).toEqual(Array.from(rawVector));
      expect(pipeline).toHaveBeenCalledTimes(1);
    });
  });

  describe("findSimilarPlan", () => {
    beforeEach(() => jest.clearAllMocks());

    it("returns the plan when similarity is above the threshold", async () => {
      const mockFind = Plan.find as jest.Mock;
      mockFind.mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: "1", embedding: [1, 0, 0] }]),
      });

      const result = await findSimilarPlan([1, 0, 0], "beginner", 5);
      expect(result).toEqual({ _id: "1", embedding: [1, 0, 0] });
      expect(mockFind).toHaveBeenCalledWith({
        currentLevel: "beginner",
        weeklyTimeHours: 5,
        embedding: { $exists: true, $ne: [] },
      });
    });

    it("returns null when no candidate meets the similarity threshold", async () => {
      const mockFind = Plan.find as jest.Mock;
      mockFind.mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: "1", embedding: [0, 1, 0] }]),
      });

      const result = await findSimilarPlan([1, 0, 0], "beginner", 5);
      expect(result).toBeNull();
    });

    it("returns null when there are no candidates", async () => {
      const mockFind = Plan.find as jest.Mock;
      mockFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

      const result = await findSimilarPlan([1, 0, 0], "beginner", 5);
      expect(result).toBeNull();
    });

    it("maps 'advanced' requests onto 'intermediate' currentLevel, matching how plans are generated", async () => {
      const mockFind = Plan.find as jest.Mock;
      mockFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

      await findSimilarPlan([1, 0, 0], "advanced", 5);
      expect(mockFind).toHaveBeenCalledWith({
        currentLevel: "intermediate",
        weeklyTimeHours: 5,
        embedding: { $exists: true, $ne: [] },
      });
    });

    it("picks the best match when multiple candidates are above the threshold", async () => {
      const mockFind = Plan.find as jest.Mock;
      mockFind.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { _id: "close", embedding: [0.9, 0.1, 0] },
          { _id: "exact", embedding: [1, 0, 0] },
        ]),
      });

      const result = await findSimilarPlan([1, 0, 0], "beginner", 5);
      expect((result as { _id?: string })?._id).toBe("exact");
    });
  });
});
