// action.ts
"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { instagramChannel } from "@/inngest/channels/instagram";
import { inngest } from "@/inngest/client";

export type InstagramToken = Realtime.Token<
  typeof instagramChannel,
  ["status"]
>;

export async function fetchInstagramRealtimeToken(): Promise<InstagramToken> {
  return await getSubscriptionToken(inngest, {
    channel: instagramChannel(),
    topics: ["status"],
  });
}
