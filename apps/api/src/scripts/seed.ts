import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";

const main = async () => {
  const passwordHash = await bcrypt.hash(process.env.SEED_OWNER_PASSWORD ?? "ChangeMe123!", 12);
  await prisma.user.upsert({
    where: { email: process.env.SEED_OWNER_EMAIL ?? "owner@example.com" },
    update: {},
    create: {
      email: process.env.SEED_OWNER_EMAIL ?? "owner@example.com",
      name: "Owner",
      role: Role.OWNER,
      passwordHash
    }
  });
};

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
