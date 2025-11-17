"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { customMailChannel } from "@/inngest/channels/custom_mail";

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
