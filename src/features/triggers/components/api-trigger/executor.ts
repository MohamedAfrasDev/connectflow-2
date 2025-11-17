import type { NodeExecutor } from "@/features/executions/types";
import { apiTriggerChannel } from "@/inngest/channels/api-trigger";

type APITriggerData = { variableName?: string };

export const apiExecutor: NodeExecutor<APITriggerData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  // 1. LOADING
  await publish(apiTriggerChannel().status({ nodeId, status: "loading" }));

  // 2. LOGIC
  const result = await step.run("process-api-payload", async () => {
    const payload = (context as any).flowInput || {};
    return { ...context, [data.variableName || "api"]: payload };
  });

  // 3. SUCCESS
  await publish(apiTriggerChannel().status({ nodeId, status: "success" }));

  return result;
};