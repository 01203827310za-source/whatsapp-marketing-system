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
  findByPhone: async (phone: string) => {
    console.log("[customerRepository.findByPhone] lookup:", { phone });
    try {
      const existingCustomer = await prisma.customer.findUnique({ where: { phone } });
      console.log("EXISTING CUSTOMER:", existingCustomer);
      return existingCustomer;
    } catch (error) {
      console.error("[customerRepository.findByPhone] Prisma error:", error);
      if (error instanceof Error) console.error(error.stack);
      throw error;
    }
  },
  upsertFromWhatsapp: async (phone: string, name?: string) => {
    console.log("[customerRepository.upsertFromWhatsapp] input:", { phone, name });
    try {
      const customer = await prisma.customer.upsert({
        where: { phone },
        create: { phone, name, lastMessageAt: new Date() },
        update: { name: name || undefined, lastMessageAt: new Date() }
      });
      console.log("UPSERTED CUSTOMER:", customer);
      return customer;
    } catch (error) {
      console.error("[customerRepository.upsertFromWhatsapp] Prisma error:", error);
      if (error instanceof Error) console.error(error.stack);
      throw error;
    }
  },
  update: async (id: string, data: Prisma.CustomerUpdateInput) => {
    console.log("[customerRepository.update] input:", { id, data });
    try {
      const customer = await prisma.customer.update({ where: { id }, data });
      console.log("[customerRepository.update] result:", customer);
      return customer;
    } catch (error) {
      console.error("[customerRepository.update] Prisma error:", error);
      if (error instanceof Error) console.error(error.stack);
      throw error;
    }
  },
  subscribedCustomers: () => prisma.customer.findMany({ where: { isSubscribed: true } })
};
