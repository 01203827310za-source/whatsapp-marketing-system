import type { NextFunction, Request, Response } from "express";
import { type Permission, rolePermissions } from "@factory/shared";
import { HttpError } from "../utils/http";

export const requirePermission = (permission: Permission) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new HttpError(401, "Authentication required");
    if (!rolePermissions[req.user.role].includes(permission)) {
      throw new HttpError(403, "Insufficient permissions");
    }
    next();
  };
};
