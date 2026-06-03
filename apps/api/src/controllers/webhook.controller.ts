import type { Request, Response } from "express";
import { env } from "../config/env";
import { whatsappProvider } from "../providers/meta-whatsapp.provider";
import { webhookService } from "../services/webhook.service";
import { HttpError } from "../utils/http";

const getQueryString = (value: unknown): string | undefined => {
  if (Array.isArray(value)) return getQueryString(value[0]);
  return typeof value === "string" ? value : undefined;
};

export const webhookController = {
  verify(req: Request, res: Response) {
    const mode = getQueryString(req.query["hub.mode"]);
    const verifyToken = getQueryString(req.query["hub.verify_token"]);
    const challenge = getQueryString(req.query["hub.challenge"]);

    console.info("[webhook:whatsapp:verify]", {
      reqQuery: req.query,
      "hub.mode": mode,
      "hub.verify_token": verifyToken,
      WHATSAPP_VERIFY_TOKEN: env.WHATSAPP_VERIFY_TOKEN
    });

    if (!whatsappProvider.verifyWebhook(req.query)) throw new HttpError(403, "Webhook verification failed");
    if (!challenge) throw new HttpError(400, "Missing webhook challenge");

    res.status(200).type("text/plain").send(challenge);
  },
  async receive(req: Request, res: Response) {
    console.log("WEBHOOK RECEIVED");
    console.log(JSON.stringify(req.body, null, 2));
    console.log("[webhook:whatsapp:receive]", {
      route: req.originalUrl,
      method: req.method,
      query: req.query,
      rawBodyBytes: req.rawBody?.length ?? 0,
      hasSignature: Boolean(req.header("X-Hub-Signature-256")),
      registeredRoute: "/webhook/whatsapp"
    });

    try {
      const verified = whatsappProvider.verifyWebhook(req.query, req.rawBody, req.header("X-Hub-Signature-256"));
      console.log("[webhook:whatsapp:receive] signature verified:", verified);

      if (!verified) throw new HttpError(403, "Invalid webhook signature");

      console.log("[webhook:whatsapp:receive] calling webhookService.process()");
      await webhookService.process(req.body, verified);
      console.log("[webhook:whatsapp:receive] webhookService.process() completed");

      res.sendStatus(200);
    } catch (error) {
      console.error("[webhook:whatsapp:receive] error:", error);
      if (error instanceof Error) console.error(error.stack);
      throw error;
    }
  }
};
