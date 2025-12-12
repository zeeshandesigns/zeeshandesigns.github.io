import { PrismaClient } from "@prisma/client";

// Global is used here to maintain a cached connection across hot reloads in development
const globalForPrisma = globalThis;

if (!globalForPrisma.prisma) {
  console.log("✓ Initializing Prisma Client...");

  // Use standard Prisma Client - it reads DATABASE_URL from .env automatically
  globalForPrisma.prisma = new PrismaClient({
    log: ["query", "error", "warn"],
  });

  console.log("✓ Prisma Client initialized successfully");
}

const prisma = globalForPrisma.prisma;

export default prisma;
