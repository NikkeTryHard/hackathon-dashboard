import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../lib/generated/prisma/client.js";

// Create adapter for seed script
const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/hackathon.db",
});

const prisma = new PrismaClient({ adapter });

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
