import { Inngest } from "inngest";
import { realtimeMiddleware } from "@inngest/realtime/middleware";

// Create a client to send and receive events
export const inngest = new Inngest({
    id: "connectflow",
    // ALWAYS include the required middleware, regardless of environment
    middleware: [realtimeMiddleware()],
    eventKey: process.env.INNGEST_EVENT_KEY,
    signingKey: process.env.INNGEST_SIGNING_KEY,
});