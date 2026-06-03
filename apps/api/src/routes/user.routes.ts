import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { asyncHandler } from "../utils/async-handler";

export const userRouter = Router();

userRouter.use(authenticate);
userRouter.get("/", requirePermission("users:manage"), asyncHandler(userController.list));
