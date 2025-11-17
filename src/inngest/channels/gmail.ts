import { channel, topic} from "@inngest/realtime";

export const GMAIL_CHANNEL_NAME = "gmail-execution";

export const gmailChannel = channel(GMAIL_CHANNEL_NAME)
.addTopic(
    topic("status").type<{
        nodeId: string;
        status: "loading" | "success" | "error";
    }>(),
); 