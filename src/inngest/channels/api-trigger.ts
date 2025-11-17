import { channel, topic } from "@inngest/realtime";

export const API_TRIGGER_CHANNEL_NAME = "api-trigger-execution";

// ⚠️ CRITICAL: This must be an Object with .addTopic("status")
export const apiTriggerChannel = channel(API_TRIGGER_CHANNEL_NAME).addTopic(
  topic("status")
);