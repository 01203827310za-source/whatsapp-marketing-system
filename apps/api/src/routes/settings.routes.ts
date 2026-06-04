import { Router } from "express";
import { settingsController } from "../controllers/settings.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { asyncHandler } from "../utils/async-handler";

export const settingsRouter = Router();

settingsRouter.use(authenticate);
settingsRouter.get("/whatsapp/status", requirePermission("settings:manage"), asyncHandler(settingsController.whatsappStatus));
