import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { ok } from "../utils/http";

export const authController = {
  async login(req: Request, res: Response) {
    res.json(ok(await authService.login(req.body.email, req.body.password)));
  },
  async refresh(req: Request, res: Response) {
    res.json(ok(await authService.refresh(req.body.refreshToken)));
  },
  me(req: Request, res: Response) {
    res.json(ok(req.user));
  }
};
