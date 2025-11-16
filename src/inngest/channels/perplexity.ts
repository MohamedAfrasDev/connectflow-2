import { channel, topic} from "@inngest/realtime";

export const PERPLEXITY_CHANNEL_NAME = "perplexity-execution";

export const perplexityChannel = channel(PERPLEXITY_CHANNEL_NAME)
.addTopic(
    topic("status").type<{
        nodeId: string;
        status: "loading" | "success" | "error";
    }>(),
); 