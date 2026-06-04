import { Router } from "express";
import multer from "multer";
import { customerController } from "../controllers/customer.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/async-handler";
import { createCustomerSchema, customerIdParamSchema, customerQuerySchema, updateCustomerSchema } from "../validators/customer.validators";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export const customerRouter = Router();

customerRouter.use(authenticate);
customerRouter.get("/", requirePermission("customers:view"), validate(customerQuerySchema), asyncHandler(customerController.list));
customerRouter.post("/", requirePermission("customers:manage"), validate(createCustomerSchema), asyncHandler(customerController.create));
customerRouter.post("/import", requirePermission("customers:manage"), upload.single("file"), asyncHandler(customerController.importCustomers));
customerRouter.get("/export", requirePermission("customers:view"), asyncHandler(customerController.exportCustomers));
customerRouter.get("/:id", requirePermission("customers:view"), validate(customerIdParamSchema), asyncHandler(customerController.get));
customerRouter.patch("/:id", requirePermission("customers:manage"), validate(updateCustomerSchema), asyncHandler(customerController.update));
customerRouter.delete("/:id", requirePermission("customers:manage"), validate(customerIdParamSchema), asyncHandler(customerController.remove));
