import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { executeWorkflow } from "@/inngest/functions";

// Create an API that serves zero functions
console.log("eventKey:", process.env.INNGEST_EVENT_KEY);
console.log("signingKey:", process.env.INNGEST_SIGNING_KEY);

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    executeWorkflow,
  ],
});