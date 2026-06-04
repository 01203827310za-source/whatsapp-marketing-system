import type { Request, Response } from "express";
import { settingsService } from "../services/settings.service";
import { ok } from "../utils/http";

export const settingsController = {
  async whatsappStatus(_req: Request, res: Response) {
    res.json(ok(await settingsService.whatsappStatus()));
  }
};
