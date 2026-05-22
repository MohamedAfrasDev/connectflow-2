import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { executeWorkflow } from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  // Use env var so local dev and production both work without code changes.
  // NEXT_PUBLIC_APP_URL must be set in your environment (e.g. http://localhost:3000).
  baseUrl: process.env.NEXT_PUBLIC_APP_URL,
  signingKey: process.env.INNGEST_SIGNING_KEY,
  functions: [executeWorkflow],
});