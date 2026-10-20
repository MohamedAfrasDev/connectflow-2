"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { customMailChannel } from "@/inngest/channels/custom_mail";
import { inngest } from "@/inngest/client";

export type CustomMailToken = Realtime.Token<
  typeof customMailChannel,
  ["status"]
>;

export async function fetchCustomMailRealtimeToken(): Promise<CustomMailToken> {
  return await getSubscriptionToken(inngest, {
    channel: customMailChannel(),
    topics: ["status"],
  });
}
