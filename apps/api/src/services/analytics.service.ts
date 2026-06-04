import { DeliveryStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { campaignRepository } from "../repositories/campaign.repository";
import { customerRepository } from "../repositories/customer.repository";

export const analyticsService = {
  async overview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [
      totalCustomers,
      subscribedCustomers,
      newCustomersToday,
      campaignCount,
      campaignsSent,
      messagesSent,
      messagesDelivered,
      messagesRead,
      recentCampaigns,
      recentCustomers
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { isSubscribed: true } }),
      prisma.customer.count({ where: { createdAt: { gte: today } } }),
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: "SENT" } }),
      prisma.message.count({ where: { status: { in: [DeliveryStatus.SENT, DeliveryStatus.DELIVERED, DeliveryStatus.READ] } } }),
      prisma.message.count({ where: { status: { in: [DeliveryStatus.DELIVERED, DeliveryStatus.READ] } } }),
      prisma.message.count({ where: { status: DeliveryStatus.READ } }),
      campaignRepository.recent(6),
      customerRepository.recent(6)
    ]);
    return {
      cards: {
        totalCustomers,
        subscribedCustomers,
        newCustomersToday,
        campaignCount,
        campaignsSent,
        messagesSent,
        messagesDelivered,
        messagesRead,
        deliveryRate: messagesSent === 0 ? 0 : Math.round((messagesDelivered / messagesSent) * 100),
        readRate: messagesDelivered === 0 ? 0 : Math.round((messagesRead / messagesDelivered) * 100)
      },
      recentCampaigns,
      recentCustomers,
      customerGrowth: await prisma.$queryRaw`select date_trunc('day', "createdAt") as day, count(*)::int as count from "Customer" group by 1 order by 1 asc`,
      subscriptionGrowth: await prisma.$queryRaw`select date_trunc('day', "subscriptionDate") as day, count(*)::int as count from "Customer" where "subscriptionDate" is not null group by 1 order by 1 asc`,
      campaignPerformance: await prisma.campaign.findMany({
        select: { id: true, title: true, type: true, recipients: { select: { status: true } } },
        orderBy: { createdAt: "desc" },
        take: 20
      })
    };
  }
};
