import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../lib/generated/prisma/client.js";
import { generateApiKey, getKeyPrefix, hashApiKey } from "../lib/api-key-hash";

// Create adapter for seed script
const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/hackathon.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Generate admin API key
  const adminKey = generateApiKey("admin");
  const prefix = getKeyPrefix(adminKey);
  const hash = await hashApiKey(adminKey);

  // Create or update admin user
  const admin = await prisma.user.upsert({
    where: { apiKeyPrefix: prefix },
    update: {},
    create: {
      name: "Admin",
      apiKeyPrefix: prefix,
      apiKeyHash: hash,
      isAdmin: true,
    },
  });

  console.log("=".repeat(60));
  console.log("ADMIN USER CREATED");
  console.log("=".repeat(60));
  console.log(`Name: ${admin.name}`);
  console.log(`ID: ${admin.id}`);
  console.log("");
  console.log("YOUR ADMIN API KEY (save this, it cannot be recovered):");
  console.log("");
  console.log(`  ${adminKey}`);
  console.log("");
  console.log("=".repeat(60));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
