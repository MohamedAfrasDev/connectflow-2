import type { NodeExecutor } from "@/features/executions/types";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";


type StripeTriggerData = Record<string, unknown>;

export const stripeTriggerExecutor: NodeExecutor<StripeTriggerData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {

    await publish(
        stripeTriggerChannel().status({
            nodeId,
            status: "loading"
        })
    );
    const result = await step.run("stripe-trigger", async () => context);

    await publish(
        stripeTriggerChannel().status({
            nodeId,
            status: "success"
        })
    );
    return result;
};