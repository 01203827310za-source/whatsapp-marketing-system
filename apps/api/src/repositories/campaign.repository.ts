import { CampaignStatus, DeliveryStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export const campaignRepository = {
  create: (data: Prisma.CampaignCreateInput) => prisma.campaign.create({ data }),
  list: () => prisma.campaign.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { recipients: true } } } }),
  findById: (id: string) =>
    prisma.campaign.findUnique({
      where: { id },
      include: { recipients: { include: { customer: true } }, messages: true, productAnnouncement: true }
    }),
  updateStatus: (id: string, status: CampaignStatus, sentAt?: Date) =>
    prisma.campaign.update({ where: { id }, data: { status, sentAt } }),
  createRecipientsForSubscribedCustomers: async (campaignId: string) => {
    const customers = await prisma.customer.findMany({ where: { isSubscribed: true }, select: { id: true } });
    if (customers.length === 0) return [];

    await prisma.campaignRecipient.deleteMany({
  where: { campaignId }
});

    await prisma.campaignRecipient.createMany({
      data: customers.map((customer) => ({ campaignId, customerId: customer.id })),
      skipDuplicates: true
    });
    return prisma.campaignRecipient.findMany({ where: { campaignId, status: DeliveryStatus.PENDING } });
  },
  markRecipient: (
    campaignId: string,
    customerId: string,
    data: Prisma.CampaignRecipientUpdateInput
  ) => prisma.campaignRecipient.update({ where: { campaignId_customerId: { campaignId, customerId } }, data }),
  updateMessageStatus: (providerMessageId: string, status: DeliveryStatus) =>
    prisma.message.updateMany({ where: { providerMessageId }, data: { status } }),
  updateRecipientStatusByProviderMessageId: (providerMessageId: string, status: DeliveryStatus) => {
    const timestamps =
      status === DeliveryStatus.DELIVERED
        ? { deliveredAt: new Date() }
        : status === DeliveryStatus.FAILED
          ? { failedAt: new Date() }
          : {};
    return prisma.campaignRecipient.updateMany({ where: { providerMessageId }, data: { status, ...timestamps } });
  }
};
