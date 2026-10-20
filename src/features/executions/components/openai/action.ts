"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { openAIChannel } from "@/inngest/channels/openai";
import { inngest } from "@/inngest/client";

export type OpenAIToken = Realtime.Token<typeof openAIChannel, ["status"]>;

export async function fetchOpenAIRealtimeToken(): Promise<OpenAIToken> {
  return await getSubscriptionToken(inngest, {
    channel: openAIChannel(),
    topics: ["status"],
  });
}
