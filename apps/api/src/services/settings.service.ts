import { env } from "../config/env";
import { prisma } from "../config/prisma";

export const settingsService = {
  async whatsappStatus() {
    const latestWebhook = await prisma.webhookLog.findFirst({ orderBy: { createdAt: "desc" } });
    return {
      configured: Boolean(env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID && env.WHATSAPP_VERIFY_TOKEN),
      phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
      lastWebhookAt: latestWebhook?.createdAt ?? null,
      lastWebhookVerified: latestWebhook?.verified ?? false
    };
  }
};
