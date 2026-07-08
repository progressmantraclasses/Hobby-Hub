import { filterCandidates } from "../services/videoFilter.service";

describe("Video Filter Service", () => {
  describe("filterCandidates", () => {
    it("filters and scores videos correctly based on duration and engagement", () => {
      const mockVideos = [
        {
          videoId: "v1",
          title: "Too short video",
          duration: "PT30S", // 30 seconds -> filtered out
          viewCount: 1000,
          likeCount: 100,
          commentCount: 10,
          subscriberCount: 500,
        },
        {
          videoId: "v2",
          title: "Good video 1",
          duration: "PT10M", // 10 mins -> kept
          viewCount: 1000,
          likeCount: 100,
          commentCount: 10,
          subscriberCount: 1000,
        },
        {
          videoId: "v3",
          title: "Too long video",
          duration: "PT2H", // 2 hours -> filtered out
          viewCount: 1000,
          likeCount: 100,
          commentCount: 10,
          subscriberCount: 10000,
        },
        {
          videoId: "v4",
          title: "Good video 2 (high engagement)",
          duration: "PT15M", // 15 mins -> kept
          viewCount: 500,
          likeCount: 100,
          commentCount: 20,
          subscriberCount: 100,
        },
      ];

      const result = filterCandidates(mockVideos);

      // Should filter out Too short and Too long, leaving only Good video 1 and Good video 2
      expect(result).toHaveLength(2);
      expect(result.map((v) => v.videoId)).toContain("v2");
      expect(result.map((v) => v.videoId)).toContain("v4");

      // Good video 2 has higher engagement (120/500 = 0.24 vs 110/1000 = 0.11), so it should score higher and rank first
      expect(result[0].videoId).toBe("v4");
    });
  });
});
