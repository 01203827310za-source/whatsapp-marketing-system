import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export const customerRepository = {
  list: async (input: { search?: string; subscribed?: boolean; page: number; limit: number }) => {
    const where: Prisma.CustomerWhereInput = {
      isSubscribed: input.subscribed,
      OR: input.search
        ? [{ name: { contains: input.search, mode: "insensitive" } }, { phone: { contains: input.search } }]
        : undefined
    };
    const [items, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (input.page - 1) * input.limit,
        take: input.limit
      }),
      prisma.customer.count({ where })
    ]);
    return { items, total };
  },
  findById: (id: string) =>
    prisma.customer.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 100 },
        recipients: { include: { campaign: true }, orderBy: { createdAt: "desc" } }
      }
    }),
  findByPhone: (phone: string) => prisma.customer.findUnique({ where: { phone } }),
  create: (data: Prisma.CustomerCreateInput) => prisma.customer.create({ data }),
  upsertFromWhatsapp: (phone: string, name?: string) =>
    prisma.customer.upsert({
      where: { phone },
      create: { phone, name, lastMessageAt: new Date() },
      update: { name: name || undefined, lastMessageAt: new Date() }
    }),
  upsertImported: async (input: { phone: string; name?: string; notes?: string; isSubscribed?: boolean }) => {
    const existing = await prisma.customer.findUnique({ where: { phone: input.phone }, select: { id: true } });
    const customer = await prisma.customer.upsert({
      where: { phone: input.phone },
      create: {
        phone: input.phone,
        name: input.name || undefined,
        notes: input.notes || undefined,
        isSubscribed: Boolean(input.isSubscribed),
        subscriptionDate: input.isSubscribed ? new Date() : undefined
      },
      update: {
        name: input.name || undefined,
        notes: input.notes || undefined,
        isSubscribed: input.isSubscribed,
        subscriptionDate: input.isSubscribed ? new Date() : undefined
      }
    });
    return { customer, created: !existing };
  },
  update: (id: string, data: Prisma.CustomerUpdateInput) => prisma.customer.update({ where: { id }, data }),
  delete: (id: string) => prisma.customer.delete({ where: { id } }),
  exportAll: () => prisma.customer.findMany({ orderBy: { createdAt: "desc" } }),
  recent: (take = 8) => prisma.customer.findMany({ orderBy: { createdAt: "desc" }, take }),
  subscribedCustomers: () => prisma.customer.findMany({ where: { isSubscribed: true } })
};
