import type { Request } from "express";
import { prisma } from "../config/prisma";

export const audit = async (req: Request, action: string, entity: string, entityId?: string, metadata?: unknown) => {
  await prisma.auditLog.create({
    data: {
      action,
      entity,
      entityId,
      metadata: metadata as object,
      userId: req.user?.id,
      ipAddress: req.ip
    }
  });
};
