import { channel, topic} from "@inngest/realtime";

export const DEEPSEEK_CHANNEL_NAME = "deepseek-execution";

export const deepSeekChannel = channel(DEEPSEEK_CHANNEL_NAME)
.addTopic(
    topic("status").type<{
        nodeId: string;
        status: "loading" | "success" | "error";
    }>(),
); 