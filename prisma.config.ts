import { defineConfig, env } from "prisma/config";
import * as dotenv from "dotenv";

dotenv.config(); // <-- load .env manually
export default defineConfig({
  schema: "prisma/schema.prisma", // must be relative to the root
  migrations: { path: "prisma/migrations" },
  engine: "classic", // library engine is required for serverless
  datasource: { url: env("DATABASE_URL") },
  // Removed 'client' property as it is not a known property in the Prisma config type
})