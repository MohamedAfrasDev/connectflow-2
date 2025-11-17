import { channel, topic} from "@inngest/realtime";

export const CUSTOM_MAIL_CHANNEL_NAME = "custom-mail-execution";

export const customMailChannel = channel(CUSTOM_MAIL_CHANNEL_NAME)
.addTopic(
    topic("status").type<{
        nodeId: string;
        status: "loading" | "success" | "error";
    }>(),
); 