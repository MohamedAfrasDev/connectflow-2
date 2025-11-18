import { channel, topic} from "@inngest/realtime";

export const INSTAGRAM_CHANNEL_NAME = "instagram-execution";

export const instagramChannel = channel(INSTAGRAM_CHANNEL_NAME)
.addTopic(
    topic("status").type<{
        nodeId: string;
        status: "loading" | "success" | "error";
    }>(),
); 