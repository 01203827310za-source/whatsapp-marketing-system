import type { Request, Response } from "express";
import { audit } from "../middlewares/audit.middleware";
import { productService } from "../services/product.service";
import { HttpError, ok } from "../utils/http";

export const productController = {
  async list(_req: Request, res: Response) {
    res.json(ok(await productService.list()));
  },
  async publishAndSend(req: Request, res: Response) {
    if (!req.user) throw new HttpError(401, "Authentication required");
    const result = await productService.publishAndSend({ ...req.body, createdById: req.user.id });
    await audit(req, "product.published", "ProductAnnouncement", result.product.id, req.body);
    res.status(201).json(ok(result));
  }
};
