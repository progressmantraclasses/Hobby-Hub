import { Request, Response } from "express";
import { chapterGenerateController } from "../controllers/chapter.controller";
import { Plan } from "../models/Plan.model";
import * as groqService from "../services/groq.service";

jest.mock("../models/Plan.model");
jest.mock("../services/groq.service");

describe("chapterGenerateController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = { params: { chapterId: "ch-1" } };
    res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("returns cached content without calling Groq if contentGenerated is true", async () => {
    const mockPlan = {
      hobby: "guitar", currentLevel: "beginner",
      chapters: [
        { id: "ch-1", title: "Intro", summary: "Sum", contentGenerated: true, steps: [{ type: "summary" }] }
      ]
    };
    (Plan.findOne as jest.Mock).mockResolvedValue(mockPlan);

    await chapterGenerateController(req as Request, res as Response, next);

    expect(Plan.findOne).toHaveBeenCalledWith({ "chapters.id": "ch-1" });
    expect(groqService.generateChapterContent).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ steps: [{ type: "summary" }] });
  });

  it("calls Groq and saves if contentGenerated is false", async () => {
    const mockPlan = {
      hobby: "guitar", currentLevel: "beginner",
      chapters: [
        { id: "ch-1", title: "Intro", summary: "Sum", contentGenerated: false }
      ]
    };
    (Plan.findOne as jest.Mock).mockResolvedValue(mockPlan);
    
    const mockContent = { steps: [{ type: "summary" }] };
    (groqService.generateChapterContent as jest.Mock).mockResolvedValue(mockContent);
    (Plan.updateOne as jest.Mock).mockResolvedValue({});

    await chapterGenerateController(req as Request, res as Response, next);

    expect(groqService.generateChapterContent).toHaveBeenCalledWith("guitar", "beginner", "Intro", "Sum");
    expect(Plan.updateOne).toHaveBeenCalledWith(
      { "chapters.id": "ch-1" },
      { $set: { "chapters.$.steps": mockContent.steps, "chapters.$.contentGenerated": true } }
    );
    expect(res.json).toHaveBeenCalledWith(mockContent);
  });
});
