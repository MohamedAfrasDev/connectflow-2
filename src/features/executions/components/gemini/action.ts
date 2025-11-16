"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { geminiChannel } from "@/inngest/channels/gemini";
import { inngest } from "@/inngest/client";

export type GeminiToken = Realtime.Token<
  typeof geminiChannel,
  ["status"]
>;

export async function fetchGeminiRealtimeToken(): Promise<GeminiToken> {
  return await getSubscriptionToken(inngest, {
    channel: geminiChannel(),
    topics: ["status"],
  });
}
