import { inngest } from "@/inngest/client";

type APITriggerData = {
  userId: string;
  action: string;
  payload?: Record<string, unknown>;
  workflowId: string;
  triggerNodeId?: string;
};

export async function triggerAPIWorkflow(data: APITriggerData) {
  const nodeId = `node-${Date.now()}`;

  try {
    // ⚠️ FIX: Send directly to "workflow/execute.workflow"
    // This prevents the "2 functions" issue.
    const result = await inngest.send({
      name: "workflow/execute.workflow", 
      data: { 
        userId: data.userId,
        nodeId: nodeId,
        
        // Pass IDs so the engine can load DB and update UI
        workflowId: data.workflowId,
        triggerNodeId: data.triggerNodeId,

        // Pass payload as flowInput so apiExecutor can grab it
        flowInput: data.payload, 
      },
    });

    console.log("Event sent:", result);
    return result;
  } catch (err: any) {
    console.error("Trigger failed:", err);
    throw err;
  }
}