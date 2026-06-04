import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/async-handler";
import { changePasswordSchema, createUserSchema, updateUserSchema } from "../validators/user.validators";

export const userRouter = Router();

userRouter.use(authenticate);
userRouter.get("/", requirePermission("users:manage"), asyncHandler(userController.list));
userRouter.post("/", requirePermission("users:manage"), validate(createUserSchema), asyncHandler(userController.create));
userRouter.patch("/:id", requirePermission("users:manage"), validate(updateUserSchema), asyncHandler(userController.update));
userRouter.post("/me/change-password", validate(changePasswordSchema), asyncHandler(userController.changePassword));
