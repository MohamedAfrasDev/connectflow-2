"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { perplexityChannel } from "@/inngest/channels/perplexity";

export type PerplexityToken = Realtime.Token<
  typeof perplexityChannel,
  ["status"]
>;

export async function fetchPerplexityRealtimeToken(): Promise<PerplexityToken> {
  return await getSubscriptionToken(inngest, {
    channel: perplexityChannel(),
    topics: ["status"],
  });
}
