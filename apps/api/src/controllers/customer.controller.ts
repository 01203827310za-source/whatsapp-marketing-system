import type { Request, Response } from "express";
import { customerRepository } from "../repositories/customer.repository";
import { audit } from "../middlewares/audit.middleware";
import { HttpError, ok } from "../utils/http";

export const customerController = {
  async list(req: Request, res: Response) {
    const subscribed = req.query.subscribed === undefined ? undefined : req.query.subscribed === "true";
    res.json(
      ok(
        await customerRepository.list({
          search: req.query.search as string | undefined,
          subscribed,
          page: Number(req.query.page),
          limit: Number(req.query.limit)
        })
      )
    );
  },
  async get(req: Request, res: Response) {
    const customer = await customerRepository.findById(req.params.id);
    if (!customer) throw new HttpError(404, "Customer not found");
    res.json(ok(customer));
  },
  async update(req: Request, res: Response) {
    const customer = await customerRepository.update(req.params.id, {
      name: req.body.name,
      notes: req.body.notes,
      isSubscribed: req.body.isSubscribed,
      subscriptionDate: req.body.isSubscribed ? new Date() : undefined
    });
    await audit(req, "customer.updated", "Customer", customer.id, req.body);
    res.json(ok(customer));
  }
};
