"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { lumaChannel } from "@/inngest/channels/luma";
import { inngest } from "@/inngest/client";

export type LumaToken = Realtime.Token<typeof lumaChannel, ["status"]>;

export async function fetchLumaRealtimeToken(): Promise<LumaToken> {
  return await getSubscriptionToken(inngest, {
    channel: lumaChannel(),
    topics: ["status"],
  });
}
