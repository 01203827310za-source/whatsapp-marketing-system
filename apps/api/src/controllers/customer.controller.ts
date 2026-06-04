import type { Request, Response } from "express";
import { audit } from "../middlewares/audit.middleware";
import { customerRepository } from "../repositories/customer.repository";
import { customerService } from "../services/customer.service";
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
  async create(req: Request, res: Response) {
    const customer = await customerService.create(req.body);
    await audit(req, "customer.created", "Customer", customer.id, req.body);
    res.status(201).json(ok(customer));
  },
  async update(req: Request, res: Response) {
    const customer = await customerService.update(req.params.id, req.body);
    await audit(req, "customer.updated", "Customer", customer.id, req.body);
    res.json(ok(customer));
  },
  async remove(req: Request, res: Response) {
    const customer = await customerService.remove(req.params.id);
    await audit(req, "customer.deleted", "Customer", customer.id);
    res.json(ok(customer));
  },
  async importCustomers(req: Request, res: Response) {
    if (!req.file) throw new HttpError(422, "CSV file is required");
    const result = await customerService.importCsv(req.file.buffer);
    await audit(req, "customer.imported", "Customer", undefined, result);
    res.status(201).json(ok(result));
  },
  async exportCustomers(_req: Request, res: Response) {
    const csv = await customerService.exportCsv();
    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header("Content-Disposition", 'attachment; filename="customers.csv"');
    res.send(csv);
  }
};
