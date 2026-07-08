import { cosineSimilarity, findSimilarPlan } from "../services/semanticCache.service";
import { Plan } from "../models/Plan.model";

jest.mock("../models/Plan.model", () => ({
  Plan: {
    find: jest.fn(),
  },
}));

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

  describe("findSimilarPlan", () => {
    it("returns null when query embedding is not implemented (null)", async () => {
      const mockFind = Plan.find as jest.Mock;
      mockFind.mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ embedding: [1, 0, 0] }]),
      });

      const result = await findSimilarPlan("guitar:beginner:5");
      expect(result).toBeNull();
    });
  });
});
