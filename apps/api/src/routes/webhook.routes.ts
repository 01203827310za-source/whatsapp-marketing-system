import { Router } from "express";
import { webhookController } from "../controllers/webhook.controller";
import { asyncHandler } from "../utils/async-handler";

export const webhookRouter = Router();

webhookRouter.get("/", webhookController.verify);
webhookRouter.post("/", asyncHandler(webhookController.receive));
