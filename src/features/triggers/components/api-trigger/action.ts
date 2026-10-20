"use server";

import { getSubscriptionToken } from "@inngest/realtime";
// 👇 Import the OBJECT (apiTriggerChannel), NOT just the name
import { apiTriggerChannel } from "@/inngest/channels/api-trigger";
import { inngest } from "@/inngest/client";

export async function fetchAPITriggerRealtimeToken() {
  return getSubscriptionToken(inngest, {
    channel: apiTriggerChannel(), // ✅ FIX: Call the function () // Pass the channel name string, not the object
    topics: ["status"], // This must match the defined topic
  });
}

import { generateAPIKey } from "@/lib/api-key"; // The encryption helper we wrote previously
import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/db";

export const getAPITriggerKey = async (workflowId: string, nodeId: string) => {
  // 1. Verify User
  const session = await requireAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // 2. Make sure the workflow (and trigger node) belongs to this user
  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      userId: session.user.id,
      nodes: { some: { id: nodeId } },
    },
    select: { id: true },
  });
  if (!workflow) {
    throw new Error("Workflow not found");
  }

  // 3. Generate the Encrypted Key
  const apiKey = generateAPIKey({
    userId: session.user.id,
    workflowId: workflowId,
    triggerNodeId: nodeId,
  });

  return apiKey;
};
