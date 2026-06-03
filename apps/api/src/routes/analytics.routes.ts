import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { asyncHandler } from "../utils/async-handler";

export const analyticsRouter = Router();

analyticsRouter.use(authenticate);
analyticsRouter.get("/", requirePermission("analytics:view"), asyncHandler(analyticsController.overview));
