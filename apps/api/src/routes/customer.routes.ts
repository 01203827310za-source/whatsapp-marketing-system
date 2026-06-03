import { Router } from "express";
import { customerController } from "../controllers/customer.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/async-handler";
import { customerQuerySchema, updateCustomerSchema } from "../validators/customer.validators";

export const customerRouter = Router();

customerRouter.use(authenticate);
customerRouter.get("/", requirePermission("customers:view"), validate(customerQuerySchema), asyncHandler(customerController.list));
customerRouter.get("/:id", requirePermission("customers:view"), asyncHandler(customerController.get));
customerRouter.patch("/:id", requirePermission("customers:manage"), validate(updateCustomerSchema), asyncHandler(customerController.update));
