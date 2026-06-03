import type { Request, Response } from "express";
import { campaignRepository } from "../repositories/campaign.repository";
import { audit } from "../middlewares/audit.middleware";
import { campaignService } from "../services/campaign.service";
import { uploadService } from "../services/upload.service";
import { HttpError, ok } from "../utils/http";

export const campaignController = {
  async list(_req: Request, res: Response) {
    res.json(ok(await campaignService.list()));
  },
  async get(req: Request, res: Response) {
    res.json(ok(await campaignService.get(req.params.id)));
  },
  async create(req: Request, res: Response) {
    if (!req.user) throw new HttpError(401, "Authentication required");
    const campaign = await campaignService.create({ ...req.body, createdById: req.user.id });
    await audit(req, "campaign.created", "Campaign", campaign.id, req.body);
    res.status(201).json(ok(campaign));
  },
  async createDiscount(req: Request, res: Response) {
    if (!req.user) throw new HttpError(401, "Authentication required");
    const campaign = await campaignService.createDiscount({ ...req.body, createdById: req.user.id });
    await audit(req, "campaign.discount_created", "Campaign", campaign.id, req.body);
    res.status(201).json(ok(campaign));
  },
  async send(req: Request, res: Response) {
    const result = await campaignService.queueCampaign(req.params.id);
    await audit(req, "campaign.queued", "Campaign", req.params.id, result);
    res.json(ok(result));
  },
  async uploadImage(req: Request, res: Response) {
    if (!req.file) throw new HttpError(422, "Image file is required");
    res.status(201).json(ok(await uploadService.uploadImage(req.file)));
  }
};
