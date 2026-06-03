import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/async-handler";
import { productAnnouncementSchema } from "../validators/product.validators";

export const productRouter = Router();

productRouter.use(authenticate);
productRouter.get("/", requirePermission("campaigns:create"), asyncHandler(productController.list));
productRouter.post("/publish", requirePermission("campaigns:manage"), validate(productAnnouncementSchema), asyncHandler(productController.publishAndSend));
