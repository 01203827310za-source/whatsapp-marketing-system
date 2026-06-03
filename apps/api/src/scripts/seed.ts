import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { hashPassword } from "../utils/password";

const ownerEmail = "owner@example.com";
const ownerPassword = "ChangeMe123!";

const main = async () => {
  const existingOwner = await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (existingOwner) {
    console.log(`Owner user already exists: ${ownerEmail}`);
    return;
  }

  const passwordHash = await hashPassword(ownerPassword);
  await prisma.user.create({
    data: {
      email: ownerEmail,
      name: "System Owner",
      role: Role.OWNER,
      passwordHash
    }
  });

  console.log(`Owner user created: ${ownerEmail}`);
};

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
