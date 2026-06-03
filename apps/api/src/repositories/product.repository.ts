import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export const productRepository = {
  create: (data: Prisma.ProductAnnouncementCreateInput) => prisma.productAnnouncement.create({ data }),
  list: () => prisma.productAnnouncement.findMany({ orderBy: { createdAt: "desc" }, include: { campaign: true } })
};
