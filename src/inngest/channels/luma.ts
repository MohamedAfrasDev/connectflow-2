import { channel, topic} from "@inngest/realtime";

export const LUMA_CHANNEL_NAME = "luma-execution";

export const lumaChannel = channel(LUMA_CHANNEL_NAME)
.addTopic(
    topic("status").type<{
        nodeId: string;
        status: "loading" | "success" | "error";
    }>(),
); 