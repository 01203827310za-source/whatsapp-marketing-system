import { CampaignStatus, CampaignType } from "@prisma/client";
import { env } from "../config/env";
import { campaignRepository } from "../repositories/campaign.repository";
import { broadcastQueue } from "../jobs/broadcast.queue";
import { HttpError } from "../utils/http";

export const campaignService = {
  async create(input: { type: CampaignType; title: string; message: string; imageUrl?: string; createdById: string }) {
    return campaignRepository.create({
      type: input.type,
      title: input.title,
      message: input.message,
      imageUrl: input.imageUrl,
      createdBy: { connect: { id: input.createdById } }
    });
  },

  async createDiscount(input: { title: string; percentage: number; startDate: Date; endDate: Date; createdById: string }) {
    if (input.endDate <= input.startDate) throw new HttpError(422, "Discount end date must be after start date");
    const message = `خصم ${input.percentage}% على منتجات مختارة من ${input.startDate.toLocaleDateString("ar-EG")} حتى ${input.endDate.toLocaleDateString("ar-EG")}.`;
    return this.create({ type: CampaignType.DISCOUNT, title: input.title, message, createdById: input.createdById });
  },

  async queueCampaign(campaignId: string) {
    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign) throw new HttpError(404, "Campaign not found");
    const recipients = await campaignRepository.createRecipientsForSubscribedCustomers(campaignId);
    await campaignRepository.updateStatus(campaignId, CampaignStatus.QUEUED);

    await broadcastQueue.addBulk(
      recipients.map((recipient, index) => ({
        name: `campaign-${campaignId}-${recipient.customerId}`,
        data: { campaignId, customerId: recipient.customerId },
        opts: { delay: Math.floor(index / env.BROADCAST_BATCH_SIZE) * env.BROADCAST_DELAY_MS }
      }))
    );
    return { queued: recipients.length };
  },

  list: () => campaignRepository.list(),
  get: async (id: string) => {
    const campaign = await campaignRepository.findById(id);
    if (!campaign) throw new HttpError(404, "Campaign not found");
    return campaign;
  }
};
