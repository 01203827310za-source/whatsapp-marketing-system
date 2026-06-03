import { DeliveryStatus, MessageDirection, Prisma } from "@prisma/client";
import { subscriptionKeywords } from "@factory/shared";
import { prisma } from "../config/prisma";
import { customerRepository } from "../repositories/customer.repository";
import { campaignRepository } from "../repositories/campaign.repository";
import { messageRepository } from "../repositories/message.repository";
import { whatsappProvider } from "../providers/meta-whatsapp.provider";

const welcomeMessage = `مرحبا بك 👋

أنت الآن على تواصل مع مصنع الملابس.

إذا كنت ترغب في استقبال:

• الموديلات الجديدة
• الخصومات
• العروض

قم بالرد بكلمة: موافق`;

const confirmationMessage = "تم تفعيل اشتراكك بنجاح. ستصلك الموديلات والعروض الجديدة من مصنع الملابس.";

const normalize = (text?: string) => text?.trim().toLowerCase();

const isDuplicateProviderMessageError = (error: unknown) => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") return false;

  const target = error.meta?.target;
  return Array.isArray(target) ? target.includes("providerMessageId") : String(target ?? "").includes("providerMessageId");
};

const logWhatsAppSendError = (label: string, error: unknown) => {
  const axiosError = error as { response?: { data?: unknown; status?: number }; message?: string };
  console.error(`${label} error.response?.data:`, axiosError.response?.data);
  console.error(`${label} error.response?.status:`, axiosError.response?.status);
  console.error(`${label} error.message:`, axiosError.message ?? error);
  if (error instanceof Error) console.error(error.stack);
};

export const webhookService = {
  async process(payload: unknown, verified: boolean) {
    console.log("[webhookService.process] start:", { verified });

    try {
      console.log("[webhookService.process] incoming payload:");
      console.log(JSON.stringify(payload, null, 2));

      const webhookLog = await prisma.webhookLog.create({
        data: { provider: "meta", eventType: "whatsapp", payload: payload as object, verified }
      });
      console.log("[webhookService.process] webhook log saved:", webhookLog);

      const events = whatsappProvider.parseIncomingWebhook(payload);
      console.log("PARSED EVENTS:", events);

      if (events.length === 0) {
        console.log("[webhookService.process] no parsed message/status events; no customers or messages will be created");
      }

      for (const event of events) {
        console.log("[webhookService.process] processing event:", event);

        if (event.status) {
          const status = event.status.toUpperCase() as DeliveryStatus;
          const messageStatusResult = await campaignRepository.updateMessageStatus(event.providerMessageId, status);
          const recipientStatusResult = await campaignRepository.updateRecipientStatusByProviderMessageId(event.providerMessageId, status);
          console.log("[webhookService.process] status update results:", {
            providerMessageId: event.providerMessageId,
            status,
            messageStatusResult,
            recipientStatusResult
          });
          continue;
        }

        const existingCustomer = await customerRepository.findByPhone(event.phone);
        const customer = await customerRepository.upsertFromWhatsapp(event.phone, event.profileName);

        try {
          const message = await messageRepository.create({
            customer: { connect: { id: customer.id } },
            direction: MessageDirection.INBOUND,
            body: event.message ?? "",
            providerMessageId: event.providerMessageId,
            rawPayload: event.raw as object
          });
          console.log("[webhookService.process] message creation result:", message);
        } catch (error) {
          if (!isDuplicateProviderMessageError(error)) throw error;

          console.log("[webhookService.process] duplicate inbound message detected; continuing subscription logic", {
            providerMessageId: event.providerMessageId,
            phone: event.phone
          });
        }

        if (!existingCustomer) {
          console.log("[webhookService.process] sending welcome message:", { to: customer.phone });
          try {
            console.log("[webhookService.process] before whatsappProvider.sendTextMessage(welcome)", { to: customer.phone });
            const welcomeResult = await whatsappProvider.sendTextMessage({ to: customer.phone, text: welcomeMessage });
            console.log("[webhookService.process] welcome message sent:", welcomeResult);
          } catch (error) {
            logWhatsAppSendError("[webhookService.process] welcome message send failed", error);
            throw error;
          }
        }

        const normalizedMessage = normalize(event.message) ?? "";
        const isSubscribeMatch = subscriptionKeywords.includes(normalizedMessage);
        console.log("NORMALIZED MESSAGE:", normalizedMessage);
        console.log("SUBSCRIPTION KEYWORDS:", subscriptionKeywords);
        console.log("IS SUBSCRIBE MATCH:", isSubscribeMatch);

        if (isSubscribeMatch) {
          console.log("[webhookService.process] before customerRepository.update(subscription)", {
            customerId: customer.id,
            phone: customer.phone,
            subscriptionDate: customer.subscriptionDate
          });
          const subscribedCustomer = await customerRepository.update(customer.id, {
            isSubscribed: true,
            subscriptionDate: customer.subscriptionDate ?? new Date()
          });
          console.log("[webhookService.process] subscription update result:", subscribedCustomer);
          console.log("[webhookService.process] sending confirmation message:", { to: customer.phone });
          try {
            console.log("[webhookService.process] before whatsappProvider.sendTextMessage(confirmation)", { to: customer.phone });
            const confirmationResult = await whatsappProvider.sendTextMessage({ to: customer.phone, text: confirmationMessage });
            console.log("[webhookService.process] confirmation message sent:", confirmationResult);
          } catch (error) {
            logWhatsAppSendError("[webhookService.process] confirmation message send failed", error);
            throw error;
          }
        }
      }
    } catch (error) {
      console.error("[webhookService.process] error:", error);
      if (error instanceof Error) console.error(error.stack);
      throw error;
    }
  }
};
