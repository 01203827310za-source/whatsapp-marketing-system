import type { Request, Response } from "express";
import { analyticsService } from "../services/analytics.service";
import { ok } from "../utils/http";

export const analyticsController = {
  async overview(_req: Request, res: Response) {
    res.json(ok(await analyticsService.overview()));
  }
};
