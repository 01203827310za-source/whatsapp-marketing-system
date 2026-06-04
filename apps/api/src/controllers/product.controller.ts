import type { Request, Response } from "express";
import { audit } from "../middlewares/audit.middleware";
import { productService } from "../services/product.service";
import { uploadService } from "../services/upload.service";
import { HttpError, ok } from "../utils/http";

export const productController = {
  async list(_req: Request, res: Response) {
    res.json(ok(await productService.list()));
  },
  async create(req: Request, res: Response) {
    const product = await productService.create(req.body);
    await audit(req, "product.created", "ProductAnnouncement", product.id, req.body);
    res.status(201).json(ok(product));
  },
  async update(req: Request, res: Response) {
    const product = await productService.update(req.params.id, req.body);
    await audit(req, "product.updated", "ProductAnnouncement", product.id, req.body);
    res.json(ok(product));
  },
  async remove(req: Request, res: Response) {
    const product = await productService.remove(req.params.id);
    await audit(req, "product.deleted", "ProductAnnouncement", product.id);
    res.json(ok(product));
  },
  async publishAndSend(req: Request, res: Response) {
    if (!req.user) throw new HttpError(401, "Authentication required");
    const result = await productService.publishAndSend({ ...req.body, createdById: req.user.id });
    await audit(req, "product.published", "ProductAnnouncement", result.product.id, req.body);
    res.status(201).json(ok(result));
  },
  async uploadImage(req: Request, res: Response) {
    if (!req.file) throw new HttpError(422, "Image file is required");
    res.status(201).json(ok(await uploadService.uploadImage(req.file)));
  },
  async categories(_req: Request, res: Response) {
    res.json(ok(await productService.categories()));
  },
  async createCategory(req: Request, res: Response) {
    const category = await productService.createCategory(req.body.name);
    await audit(req, "product_category.created", "ProductCategory", category.id, req.body);
    res.status(201).json(ok(category));
  },
  async deleteCategory(req: Request, res: Response) {
    const category = await productService.deleteCategory(req.params.id);
    await audit(req, "product_category.deleted", "ProductCategory", category.id);
    res.json(ok(category));
  },
  async addGalleryImage(req: Request, res: Response) {
    const image = await productService.addGalleryImage(req.params.id, req.body);
    await audit(req, "product_gallery.created", "ProductImage", image.id, req.body);
    res.status(201).json(ok(image));
  },
  async deleteGalleryImage(req: Request, res: Response) {
    const image = await productService.deleteGalleryImage(req.params.id);
    await audit(req, "product_gallery.deleted", "ProductImage", image.id);
    res.json(ok(image));
  }
};
