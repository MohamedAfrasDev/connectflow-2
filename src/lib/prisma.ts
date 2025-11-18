import { PrismaClient } from "@/generated/prisma/client";

declare global {
  // Avoid multiple instances in dev
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"], // optional
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
