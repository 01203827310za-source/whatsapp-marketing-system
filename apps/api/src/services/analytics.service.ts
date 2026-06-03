import { DeliveryStatus } from "@prisma/client";
import { prisma } from "../config/prisma";

export const analyticsService = {
  async overview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [totalCustomers, subscribedCustomers, newCustomersToday, campaignsSent, messagesDelivered] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { isSubscribed: true } }),
      prisma.customer.count({ where: { createdAt: { gte: today } } }),
      prisma.campaign.count({ where: { status: "SENT" } }),
      prisma.message.count({ where: { status: DeliveryStatus.DELIVERED } })
    ]);
    const sent = await prisma.message.count({ where: { status: { in: [DeliveryStatus.SENT, DeliveryStatus.DELIVERED, DeliveryStatus.READ] } } });
    return {
      cards: {
        totalCustomers,
        subscribedCustomers,
        newCustomersToday,
        campaignsSent,
        messagesDelivered,
        deliveryRate: sent === 0 ? 0 : Math.round((messagesDelivered / sent) * 100)
      },
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
