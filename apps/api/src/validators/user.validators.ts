import { ROLES } from "@factory/shared";
import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().min(2),
    password: z.string().min(8),
    role: z.enum(ROLES)
  })
});

export const updateUserSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().min(2).optional(),
    role: z.enum(ROLES).optional(),
    isActive: z.boolean().optional()
  })
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8)
  })
});

export const userIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) })
});
