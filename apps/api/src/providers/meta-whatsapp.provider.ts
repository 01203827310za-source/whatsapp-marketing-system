import axios from "axios";
import crypto from "crypto";
import { env } from "../config/env";
import type {
  IncomingWhatsAppMessage,
  WhatsAppImageMessage,
  WhatsAppProvider,
  WhatsAppTemplateMessage,
  WhatsAppTextMessage
} from "./whatsapp.provider";

const getQueryString = (value: unknown): string | undefined => {
  if (Array.isArray(value)) return getQueryString(value[0]);
  return typeof value === "string" ? value : undefined;
};

const isWhatsAppE164 = (phone: string) => /^\d{8,15}$/.test(phone);

const logAxiosError = (label: string, error: unknown) => {
  if (axios.isAxiosError(error)) {
    console.error(`${label} error.response?.data:`, error.response?.data);
    console.error(`${label} error.response?.status:`, error.response?.status);
    console.error(`${label} error.message:`, error.message);
    console.error(`${label} full Axios error response:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      data: error.response?.data
    });
    return;
  }

  console.error(`${label} error.message:`, error instanceof Error ? error.message : error);
};

export class MetaWhatsAppProvider implements WhatsAppProvider {
  private readonly api = axios.create({
    baseURL: `https://graph.facebook.com/v19.0/${env.WHATSAPP_PHONE_NUMBER_ID}`,
    headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}` }
  });

  async sendTextMessage(message: WhatsAppTextMessage) {
    const requestBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: message.to,
      type: "text",
      text: { preview_url: false, body: message.text }
    };

    console.log("[meta-whatsapp.sendTextMessage] destination phone:", message.to);
    console.log("[meta-whatsapp.sendTextMessage] destination E.164-like:", isWhatsAppE164(message.to));
    console.log("[meta-whatsapp.sendTextMessage] phone number id:", env.WHATSAPP_PHONE_NUMBER_ID);
    console.log("[meta-whatsapp.sendTextMessage] access token present:", Boolean(env.WHATSAPP_ACCESS_TOKEN));
    console.log("[meta-whatsapp.sendTextMessage] access token length:", env.WHATSAPP_ACCESS_TOKEN.length);
    console.log("[meta-whatsapp.sendTextMessage] request body:", requestBody);

    try {
      const response = await this.api.post("/messages", requestBody);
      const result = { providerMessageId: response.data.messages[0].id as string };
      console.log("[meta-whatsapp.sendTextMessage] Meta API response status:", response.status);
      console.log("[meta-whatsapp.sendTextMessage] Meta API response data:", response.data);
      console.log("[meta-whatsapp.sendTextMessage] result:", result);
      return result;
    } catch (error) {
      logAxiosError("[meta-whatsapp.sendTextMessage]", error);
      if (error instanceof Error) console.error(error.stack);
      throw error;
    }
  }

  async sendImageMessage(message: WhatsAppImageMessage) {
    const requestBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: message.to,
      type: "image",
      image: { link: message.imageUrl, caption: message.caption }
    };

    console.log("[meta-whatsapp.sendImageMessage] destination phone:", message.to);
    console.log("[meta-whatsapp.sendImageMessage] destination E.164-like:", isWhatsAppE164(message.to));
    console.log("[meta-whatsapp.sendImageMessage] request body:", requestBody);

    try {
      const response = await this.api.post("/messages", requestBody);
      console.log("[meta-whatsapp.sendImageMessage] Meta API response status:", response.status);
      console.log("[meta-whatsapp.sendImageMessage] Meta API response data:", response.data);
      return { providerMessageId: response.data.messages[0].id as string };
    } catch (error) {
      logAxiosError("[meta-whatsapp.sendImageMessage]", error);
      if (error instanceof Error) console.error(error.stack);
      throw error;
    }
  }

  async sendTemplateMessage(message: WhatsAppTemplateMessage) {
    const requestBody = {
      messaging_product: "whatsapp",
      to: message.to,
      type: "template",
      template: {
        name: message.templateName,
        language: { code: message.languageCode },
        components: message.components
      }
    };

    console.log("[meta-whatsapp.sendTemplateMessage] destination phone:", message.to);
    console.log("[meta-whatsapp.sendTemplateMessage] destination E.164-like:", isWhatsAppE164(message.to));
    console.log("[meta-whatsapp.sendTemplateMessage] request body:", requestBody);

    try {
      const response = await this.api.post("/messages", requestBody);
      console.log("[meta-whatsapp.sendTemplateMessage] Meta API response status:", response.status);
      console.log("[meta-whatsapp.sendTemplateMessage] Meta API response data:", response.data);
      return { providerMessageId: response.data.messages[0].id as string };
    } catch (error) {
      logAxiosError("[meta-whatsapp.sendTemplateMessage]", error);
      if (error instanceof Error) console.error(error.stack);
      throw error;
    }
  }

  verifyWebhook(query: Record<string, unknown>, rawBody?: Buffer, signature?: string) {
    console.log("[meta-whatsapp.verifyWebhook]", {
      mode: getQueryString(query["hub.mode"]),
      hasRawBody: Boolean(rawBody),
      rawBodyBytes: rawBody?.length ?? 0,
      hasSignature: Boolean(signature)
    });

    if (getQueryString(query["hub.mode"]) === "subscribe") {
      const verified = getQueryString(query["hub.verify_token"]) === env.WHATSAPP_VERIFY_TOKEN;
      console.log("[meta-whatsapp.verifyWebhook] GET verification result:", verified);
      return verified;
    }
    if (!rawBody || !signature) return false;
    const expected = `sha256=${crypto.createHmac("sha256", env.WHATSAPP_APP_SECRET).update(rawBody).digest("hex")}`;
    console.log("[meta-whatsapp.verifyWebhook] POST signature comparison:", {
      expectedLength: expected.length,
      actualLength: signature.length
    });
    if (expected.length !== signature.length) return false;
    const verified = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    console.log("[meta-whatsapp.verifyWebhook] POST verification result:", verified);
    return verified;
  }

  parseIncomingWebhook(payload: unknown): IncomingWhatsAppMessage[] {
    const body = payload as any;
    const changes = body.entry?.flatMap((entry: any) => entry.changes ?? []) ?? [];
    console.log("[meta-whatsapp.parseIncomingWebhook] payload:", JSON.stringify(payload, null, 2));
    console.log("[meta-whatsapp.parseIncomingWebhook] entry count:", body.entry?.length ?? 0);
    console.log("[meta-whatsapp.parseIncomingWebhook] change count:", changes.length);

    const events = changes.flatMap((change: any) => {
      const value = change.value;
      const contacts = new Map((value.contacts ?? []).map((c: any) => [c.wa_id, c.profile?.name]));
      console.log("[meta-whatsapp.parseIncomingWebhook] change summary:", {
        field: change.field,
        contactCount: value.contacts?.length ?? 0,
        messageCount: value.messages?.length ?? 0,
        statusCount: value.statuses?.length ?? 0
      });
      const messages =
        value.messages?.map((m: any) => ({
          providerMessageId: m.id,
          phone: m.from,
          profileName: contacts.get(m.from),
          message: m.text?.body ?? m.button?.text,
          raw: m
        })) ?? [];
      const statuses =
        value.statuses?.map((s: any) => ({
          providerMessageId: s.id,
          phone: s.recipient_id,
          status: s.status,
          raw: s
        })) ?? [];
      return [...messages, ...statuses];
    });
    console.log("PARSED EVENTS:", events);
    return events;
  }
}

export const whatsappProvider = new MetaWhatsAppProvider();
