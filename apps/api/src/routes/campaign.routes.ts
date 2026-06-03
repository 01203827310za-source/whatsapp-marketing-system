import { Router } from "express";
import multer from "multer";
import { campaignController } from "../controllers/campaign.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/async-handler";
import { createCampaignSchema, discountCampaignSchema, idParamSchema } from "../validators/campaign.validators";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export const campaignRouter = Router();

campaignRouter.use(authenticate);
campaignRouter.get("/", requirePermission("campaigns:create"), asyncHandler(campaignController.list));
campaignRouter.post("/", requirePermission("campaigns:create"), validate(createCampaignSchema), asyncHandler(campaignController.create));
campaignRouter.post("/discounts", requirePermission("campaigns:create"), validate(discountCampaignSchema), asyncHandler(campaignController.createDiscount));
campaignRouter.post("/uploads", requirePermission("campaigns:create"), upload.single("image"), asyncHandler(campaignController.uploadImage));
campaignRouter.get("/:id", requirePermission("campaigns:create"), validate(idParamSchema), asyncHandler(campaignController.get));
campaignRouter.post("/:id/send", requirePermission("campaigns:manage"), validate(idParamSchema), asyncHandler(campaignController.send));
