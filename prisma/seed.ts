import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { apiKey: "admin" },
    update: {},
    create: {
      name: "Admin",
      apiKey: "admin",
      isAdmin: true,
    },
  });

  console.log("Created admin user:", admin);

  // Create Louis as admin
  const louis = await prisma.user.upsert({
    where: { apiKey: "sk-hackathon-louis" },
    update: {},
    create: {
      name: "Louis",
      apiKey: "sk-hackathon-louis",
      isAdmin: true,
    },
  });

  console.log("Created user:", louis);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
