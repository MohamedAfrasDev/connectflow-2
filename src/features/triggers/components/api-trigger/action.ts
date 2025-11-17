"use server";

import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
// 👇 Import the OBJECT (apiTriggerChannel), NOT just the name
import { apiTriggerChannel } from "@/inngest/channels/api-trigger";

export async function fetchAPITriggerRealtimeToken() {
  return getSubscriptionToken(inngest, {
    channel: apiTriggerChannel(), // ✅ FIX: Call the function () // Pass the channel name string, not the object
    topics: ["status"],              // This must match the defined topic
  });
}




import { generateAPIKey } from "@/lib/api-key"; // The encryption helper we wrote previously
import { auth } from "@/lib/auth";
import { requireAuth } from "@/lib/auth-utils";

export const getAPITriggerKey = async (workflowId: string, nodeId: string) => {
  // 1. Verify User
  const session = await requireAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // 2. Generate the Encrypted Key
  const apiKey = generateAPIKey({
    userId: session.user.id,
    workflowId: workflowId,
    triggerNodeId: nodeId,
  });

  return apiKey;
};