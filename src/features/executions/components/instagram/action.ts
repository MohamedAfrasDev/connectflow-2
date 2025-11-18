// action.ts
"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { instagramChannel } from "@/inngest/channels/instagram";

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
