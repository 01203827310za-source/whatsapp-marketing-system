import crypto from "crypto";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { MetaWhatsAppProvider } from "../../src/providers/meta-whatsapp.provider";

describe("WhatsApp webhook verification", () => {
  it("returns the challenge as a plain text response for Meta verification", async () => {
    const app = createApp();

    const response = await request(app)
      .get("/webhook/whatsapp")
      .query({
        "hub.mode": "subscribe",
        "hub.verify_token": "verify-token",
        "hub.challenge": "123456"
      })
      .expect(200);

    expect(response.text).toBe("123456");
    expect(response.headers["content-type"]).toContain("text/plain");
  });

  it("accepts the configured Meta subscribe verify token", () => {
    const provider = new MetaWhatsAppProvider();

    expect(
      provider.verifyWebhook({
        "hub.mode": "subscribe",
        "hub.verify_token": "verify-token",
        "hub.challenge": "123456"
      })
    ).toBe(true);
  });

  it("validates POST payload signatures with the configured app secret", () => {
    const provider = new MetaWhatsAppProvider();
    const rawBody = Buffer.from(JSON.stringify({ object: "whatsapp_business_account" }));
    const signature = `sha256=${crypto.createHmac("sha256", "app-secret").update(rawBody).digest("hex")}`;

    expect(provider.verifyWebhook({}, rawBody, signature)).toBe(true);
    expect(provider.verifyWebhook({}, rawBody, "sha256=invalid")).toBe(false);
  });
});
