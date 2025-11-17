"use server";

import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
// 👇 Import the OBJECT (apiTriggerChannel), NOT just the name
import { apiTriggerChannel } from "@/inngest/channels/api-trigger";

export async function fetchAPITriggerRealtimeToken() {
  return getSubscriptionToken(inngest, {
    channel: apiTriggerChannel(), // ✅ FIX: Call the function () // Pass the channel name string, not the object
    topics: ["status"],              // This must match the defined topic
  });
}