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
  // 1. Publish LOADING
  await publish?.(apiTriggerChannel().status({ nodeId, status: "loading" }));

  // 2. Run executor
  const result = await step.run("process-api-payload", async () => {
    const api = (context as any).api ?? {};
    const key = data.variableName || "apiCall";

    // Wrap apiCall inside api
    return {
      api: {
       
        [key]: api,
      },
    };
  });

  // 3. Publish SUCCESS
  await publish?.(apiTriggerChannel().status({ nodeId, status: "success" }));

  return result;
};
