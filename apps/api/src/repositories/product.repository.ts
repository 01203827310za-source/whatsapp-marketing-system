import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export const productRepository = {
  create: (data: Prisma.ProductAnnouncementCreateInput) =>
    prisma.productAnnouncement.create({ data, include: { category: true, gallery: { orderBy: { sortOrder: "asc" } } } }),
  update: (id: string, data: Prisma.ProductAnnouncementUpdateInput) =>
    prisma.productAnnouncement.update({ where: { id }, data, include: { category: true, gallery: { orderBy: { sortOrder: "asc" } } } }),
  delete: (id: string) => prisma.productAnnouncement.delete({ where: { id } }),
  findById: (id: string) =>
    prisma.productAnnouncement.findUnique({
      where: { id },
      include: { category: true, gallery: { orderBy: { sortOrder: "asc" } }, campaign: true }
    }),
  list: () =>
    prisma.productAnnouncement.findMany({
      orderBy: { createdAt: "desc" },
      include: { campaign: true, category: true, gallery: { orderBy: { sortOrder: "asc" } } }
    }),
  createCategory: (name: string) => prisma.productCategory.create({ data: { name } }),
  listCategories: () =>
    prisma.productCategory.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } }),
  deleteCategory: (id: string) => prisma.productCategory.delete({ where: { id } }),
  addImage: (productId: string, data: { imageUrl: string; altText?: string; sortOrder?: number }) =>
    prisma.productImage.create({ data: { productId, ...data } }),
  deleteImage: (id: string) => prisma.productImage.delete({ where: { id } })
};
