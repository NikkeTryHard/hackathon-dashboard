import { defineConfig } from "prisma/config";

export default defineConfig({
  // Path to schema file
  schema: "prisma/schema.prisma",

  // Migration and seed configuration
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },

  // Datasource configuration (moved from schema.prisma)
  datasource: {
    url: "file:./prisma/hackathon.db",
  },
});
