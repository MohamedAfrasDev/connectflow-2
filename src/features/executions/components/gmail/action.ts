"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { gmailChannel } from "@/inngest/channels/gmail";

export type GmailToken = Realtime.Token<
  typeof gmailChannel,
  ["status"]
>;

export async function fetchGmailRealtimeToken(): Promise<GmailToken> {
  return await getSubscriptionToken(inngest, {
    channel: gmailChannel(),
    topics: ["status"],
  });
}
