"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { gmailChannel } from "@/inngest/channels/gmail";
import { inngest } from "@/inngest/client";

export type GmailToken = Realtime.Token<typeof gmailChannel, ["status"]>;

export async function fetchGmailRealtimeToken(): Promise<GmailToken> {
  return await getSubscriptionToken(inngest, {
    channel: gmailChannel(),
    topics: ["status"],
  });
}
