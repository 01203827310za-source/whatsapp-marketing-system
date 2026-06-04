import type { Request, Response } from "express";
import { userRepository } from "../repositories/user.repository";
import { audit } from "../middlewares/audit.middleware";
import { userService } from "../services/user.service";
import { HttpError, ok } from "../utils/http";

export const userController = {
  async list(_req: Request, res: Response) {
    const users = await userRepository.list();
    res.json(ok(users.map(({ passwordHash, ...user }) => user)));
  },
  async create(req: Request, res: Response) {
    const user = await userService.create(req.body);
    await audit(req, "user.created", "User", user.id, { email: user.email, role: user.role });
    res.status(201).json(ok(user));
  },
  async update(req: Request, res: Response) {
    const user = await userService.update(req.params.id, req.body);
    await audit(req, "user.updated", "User", user.id, req.body);
    res.json(ok(user));
  },
  async changePassword(req: Request, res: Response) {
    if (!req.user) throw new HttpError(401, "Authentication required");
    const result = await userService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    await audit(req, "user.password_changed", "User", req.user.id);
    res.json(ok(result));
  }
};
