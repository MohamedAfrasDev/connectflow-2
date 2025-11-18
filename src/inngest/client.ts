import { Inngest } from "inngest";

import { realtimeMiddleware } from "@inngest/realtime/middleware";

// Create a client to send and receive events
export const inngest = new Inngest({
    id: "connectflow",
    middleware: process.env.NODE_ENV === "development" ? [realtimeMiddleware()] : undefined,
    eventKey: process.env.INNGEST_EVENT_KEY,
    signingKey: process.env.INNGEST_SIGNING_KEY,
});