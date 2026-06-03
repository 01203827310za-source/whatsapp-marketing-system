import { prisma } from "../config/prisma";

export const userRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
  list: () => prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
  createRefreshToken: (userId: string, tokenHash: string, expiresAt: Date) =>
    prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } }),
  findRefreshToken: (tokenHash: string) =>
    prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } }),
  revokeRefreshToken: (id: string) =>
    prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } })
};
