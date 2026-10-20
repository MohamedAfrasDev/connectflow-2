"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { deepSeekChannel } from "@/inngest/channels/deepseek";
import { inngest } from "@/inngest/client";

export type DeepSeekToken = Realtime.Token<typeof deepSeekChannel, ["status"]>;

export async function fetchDeepSeekRealtimeToken(): Promise<DeepSeekToken> {
  return await getSubscriptionToken(inngest, {
    channel: deepSeekChannel(),
    topics: ["status"],
  });
}
