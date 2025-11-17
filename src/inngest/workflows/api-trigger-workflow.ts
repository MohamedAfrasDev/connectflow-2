// /features/triggers/api-trigger.ts
import { inngest } from "@/inngest/client";

export type APITriggerData = {
  userId: string;
  action: string;
  payload?: Record<string, unknown>;
  workflowId: string;
  triggerNodeId?: string;
};

export async function triggerAPIWorkflow(data: APITriggerData) {
  const nodeId = `node-${Date.now()}`;

  try {
    const result = await inngest.send({
      name: "workflow/execute.workflow", // workflow trigger name
      data: {
        userId: data.userId,
        action: data.action,
        nodeId,
        workflowId: data.workflowId,
        api: data.payload, // <-- pass payload here
      },
    });

    console.log("Event sent to Inngest:", result);
    return result;
  } catch (err: any) {
    console.error("Failed to trigger workflow:", err);
    throw err;
  }
}
