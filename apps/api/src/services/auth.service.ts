import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { userRepository } from "../repositories/user.repository";
import { HttpError } from "../utils/http";
import { verifyPassword } from "../utils/password";
import type { AuthUser } from "@factory/shared";

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

const signAccessToken = (user: AuthUser) =>
  jwt.sign(user, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });
const signRefreshToken = (user: AuthUser) =>
  jwt.sign({ id: user.id }, env.JWT_REFRESH_SECRET, {
    expiresIn: `${env.JWT_REFRESH_DAYS}d` as jwt.SignOptions["expiresIn"]
  });

export const authService = {
  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.isActive) throw new HttpError(401, "Invalid credentials");

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) throw new HttpError(401, "Invalid credentials");

    const authUser: AuthUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    const accessToken = signAccessToken(authUser);
    const refreshToken = signRefreshToken(authUser);
    const expiresAt = new Date(Date.now() + env.JWT_REFRESH_DAYS * 24 * 60 * 60 * 1000);
    await userRepository.createRefreshToken(user.id, hashToken(refreshToken), expiresAt);

    return { accessToken, refreshToken, user: authUser };
  },

  async refresh(refreshToken: string) {
    try {
      jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      throw new HttpError(401, "Invalid refresh token");
    }

    const stored = await userRepository.findRefreshToken(hashToken(refreshToken));
    if (!stored || stored.revokedAt || stored.expiresAt < new Date() || !stored.user.isActive) {
      throw new HttpError(401, "Invalid refresh token");
    }

    await userRepository.revokeRefreshToken(stored.id);
    const authUser: AuthUser = {
      id: stored.user.id,
      email: stored.user.email,
      name: stored.user.name,
      role: stored.user.role
    };
    const nextAccessToken = signAccessToken(authUser);
    const nextRefreshToken = signRefreshToken(authUser);
    const expiresAt = new Date(Date.now() + env.JWT_REFRESH_DAYS * 24 * 60 * 60 * 1000);
    await userRepository.createRefreshToken(stored.userId, hashToken(nextRefreshToken), expiresAt);
    return { accessToken: nextAccessToken, refreshToken: nextRefreshToken, user: authUser };
  }
};
