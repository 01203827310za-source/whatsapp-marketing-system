import type { Request, Response } from "express";
import { userRepository } from "../repositories/user.repository";
import { ok } from "../utils/http";

export const userController = {
  async list(_req: Request, res: Response) {
    const users = await userRepository.list();
    res.json(ok(users.map(({ passwordHash, ...user }) => user)));
  }
};
