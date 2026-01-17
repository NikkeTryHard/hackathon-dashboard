import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma";

// Create the SQLite adapter with file path
const adapter = new PrismaBetterSQLite3({
  url: "file:./prisma/hackathon.db",
});

// Global singleton pattern for Next.js hot reload
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
