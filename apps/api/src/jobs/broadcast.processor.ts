import { CampaignStatus, DeliveryStatus, MessageDirection } from "@prisma/client";
import type { Job } from "bullmq";
import { prisma } from "../config/prisma";
import { whatsappProvider } from "../providers/meta-whatsapp.provider";
import { campaignRepository } from "../repositories/campaign.repository";
import { messageRepository } from "../repositories/message.repository";
import type { BroadcastJobData } from "./broadcast.queue";

export const processBroadcastJob = async (data: BroadcastJobData, attemptsMade = 0) => {
  const { campaignId, customerId } = data;
  const campaign = await prisma.campaign.findUnique({
  where: { id: campaignId }
});

const customer = await prisma.customer.findUnique({
  where: { id: customerId }
});

console.log("[broadcast] campaign:", campaign?.id);
console.log("[broadcast] customer:", customer?.id);
console.log("[broadcast] subscribed:", customer?.isSubscribed);

if (!campaign || !customer || !customer.isSubscribed) {
  console.log("[broadcast] EARLY RETURN", {
    campaignExists: !!campaign,
    customerExists: !!customer,
    subscribed: customer?.isSubscribed
  });

  return;
}

const lock = await prisma.campaignRecipient.updateMany({
  where: {
    campaignId,
    customerId,
    status: DeliveryStatus.PENDING
  },
  data: {
    attempts: { increment: 1 }
  }
});

console.log("[broadcast] lock result:", lock);

if (lock.count === 0) {
  console.log("[broadcast] LOCK FAILED");
  return;
}

console.log("[broadcast] lock result:", lock);

if (lock.count === 0) {
  console.log("[broadcast] LOCK FAILED");
  return;
}

  console.log("[broadcast.processor] sending WhatsApp campaign message:", {
    campaignId,
    customerId,
    to: customer.phone,
    hasImage: Boolean(campaign.imageUrl)
  });

  let result: { providerMessageId: string };
  try {
    result = campaign.imageUrl
      ? await whatsappProvider.sendImageMessage({ to: customer.phone, imageUrl: campaign.imageUrl, caption: campaign.message })
      : await whatsappProvider.sendTextMessage({ to: customer.phone, text: campaign.message });
    console.log("[broadcast.processor] WhatsApp campaign message sent:", result);
  } catch (error) {
    const axiosError = error as { response?: { data?: unknown; status?: number }; message?: string };
    console.error("[broadcast.processor] WhatsApp campaign send failed error.response?.data:", axiosError.response?.data);
    console.error("[broadcast.processor] WhatsApp campaign send failed error.response?.status:", axiosError.response?.status);
    console.error("[broadcast.processor] WhatsApp campaign send failed error.message:", axiosError.message ?? error);
    if (error instanceof Error) console.error(error.stack);
    throw error;
  }

  await campaignRepository.markRecipient(campaignId, customerId, {
    status: DeliveryStatus.SENT,
    sentAt: new Date(),
    providerMessageId: result.providerMessageId
  });

  await messageRepository.create({
    customer: { connect: { id: customer.id } },
    campaign: { connect: { id: campaign.id } },
    direction: MessageDirection.OUTBOUND,
    body: campaign.message,
    mediaUrl: campaign.imageUrl,
    providerMessageId: result.providerMessageId,
    status: DeliveryStatus.SENT
  });

  const pending = await prisma.campaignRecipient.count({
    where: { campaignId, status: DeliveryStatus.PENDING }
  });
  if (pending === 0) {
    await campaignRepository.updateStatus(campaignId, CampaignStatus.SENT, new Date());
  }
};

export const markFailedIfExhausted = async (job: Pick<Job<BroadcastJobData>, "data" | "attemptsMade" | "opts"> | undefined) => {
  if (!job) return;
  const attempts = job.opts.attempts ?? 3;
  if (job.attemptsMade >= attempts) {
    await campaignRepository.markRecipient(job.data.campaignId, job.data.customerId, {
      status: DeliveryStatus.FAILED,
      failedAt: new Date()
    });
  }
};
