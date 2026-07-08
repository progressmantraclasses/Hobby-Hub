import type { Request, Response, NextFunction } from "express";
import { searchVideos } from "../services/youtube.service";
import { filterCandidates, rankWithLLM } from "../services/videoFilter.service";

export async function getTechniqueVideo(req: Request, res: Response, next: NextFunction) {
  const query = req.query.query;
  if (!query || typeof query !== "string") {
    res.status(400).json({ error: "Missing or invalid query parameter" });
    return;
  }

  try {
    const rawVideos = await searchVideos(query);
    const shortlist = filterCandidates(rawVideos);
    const recommendation = await rankWithLLM(shortlist, query);

    if (!recommendation) {
      res.status(404).json({ error: "No suitable learning videos found" });
      return;
    }

    res.json(recommendation);
  } catch (err) {
    next(err);
  }
}
