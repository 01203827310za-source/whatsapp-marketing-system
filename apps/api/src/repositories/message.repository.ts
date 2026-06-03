import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export const messageRepository = {
  create: async (data: Prisma.MessageCreateInput) => {
    console.log("[messageRepository.create] input:", data);
    try {
      const message = await prisma.message.create({ data });
      console.log("[messageRepository.create] result:", message);
      console.log("MESSAGE SAVED");
      return message;
    } catch (error) {
      console.error("[messageRepository.create] Prisma error:", error);
      if (error instanceof Error) console.error(error.stack);
      throw error;
    }
  },
  listRecent: () => prisma.message.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
};
