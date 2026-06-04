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
      route: req.originalUrl,
      "hub.mode": mode,
      hasVerifyToken: Boolean(verifyToken),
      hasChallenge: Boolean(challenge)
    });

    if (mode !== "subscribe" || verifyToken !== env.WHATSAPP_VERIFY_TOKEN || !challenge) {
      throw new HttpError(403, "Webhook verification failed");
    }

    res.status(200).type("text/plain").send(challenge);
  },
  async receive(req: Request, res: Response) {
    console.log("[webhook:whatsapp:receive]", {
      route: req.originalUrl,
      method: req.method,
      query: req.query,
      rawBodyBytes: req.rawBody?.length ?? 0,
      hasSignature: Boolean(req.header("X-Hub-Signature-256"))
    });
    console.log("[webhook:whatsapp:receive] payload:", JSON.stringify(req.body, null, 2));

    res.sendStatus(200);

    void (async () => {
      const verified = whatsappProvider.verifyWebhook(req.query, req.rawBody, req.header("X-Hub-Signature-256"));
      console.log("[webhook:whatsapp:receive] signature verified:", verified);

      if (!verified) return;

      console.log("[webhook:whatsapp:receive] calling webhookService.process()");
      await webhookService.process(req.body, verified);
      console.log("[webhook:whatsapp:receive] webhookService.process() completed");
    })().catch((error: unknown) => {
      console.error("[webhook:whatsapp:receive] error:", error);
      if (error instanceof Error) console.error(error.stack);
    });
  }
};
