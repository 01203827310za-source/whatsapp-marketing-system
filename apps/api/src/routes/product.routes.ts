import { Router } from "express";
import multer from "multer";
import { productController } from "../controllers/product.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/async-handler";
import {
  categorySchema,
  galleryImageSchema,
  productAnnouncementSchema,
  productIdParamSchema,
  productSchema,
  updateProductSchema
} from "../validators/product.validators";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export const productRouter = Router();

productRouter.use(authenticate);
productRouter.get("/", requirePermission("campaigns:create"), asyncHandler(productController.list));
productRouter.post("/", requirePermission("campaigns:manage"), validate(productSchema), asyncHandler(productController.create));
productRouter.post("/publish", requirePermission("campaigns:manage"), validate(productAnnouncementSchema), asyncHandler(productController.publishAndSend));
productRouter.post("/uploads", requirePermission("campaigns:manage"), upload.single("image"), asyncHandler(productController.uploadImage));
productRouter.get("/categories", requirePermission("campaigns:create"), asyncHandler(productController.categories));
productRouter.post("/categories", requirePermission("campaigns:manage"), validate(categorySchema), asyncHandler(productController.createCategory));
productRouter.delete("/categories/:id", requirePermission("campaigns:manage"), validate(productIdParamSchema), asyncHandler(productController.deleteCategory));
productRouter.patch("/:id", requirePermission("campaigns:manage"), validate(updateProductSchema), asyncHandler(productController.update));
productRouter.delete("/:id", requirePermission("campaigns:manage"), validate(productIdParamSchema), asyncHandler(productController.remove));
productRouter.post("/:id/gallery", requirePermission("campaigns:manage"), validate(galleryImageSchema), asyncHandler(productController.addGalleryImage));
productRouter.delete("/gallery/:id", requirePermission("campaigns:manage"), validate(productIdParamSchema), asyncHandler(productController.deleteGalleryImage));
