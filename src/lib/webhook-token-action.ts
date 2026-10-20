"use server";

import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/db";
import { createWebhookToken } from "@/lib/webhook-token";

/** Returns the webhook token only for workflows owned by the signed-in user. */
export async function getWebhookToken(workflowId: string): Promise<string> {
  const session = await requireAuth();
  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, userId: session.user.id },
    select: { id: true },
  });
  if (!workflow) throw new Error("Workflow not found");
  return createWebhookToken(workflowId);
}
