import { NextRequest, NextResponse } from "next/server";
import { triggerAPIWorkflow } from "@/inngest/workflows/api-trigger-workflow"; 
import { decryptAPIKey } from "@/lib/api-key";

export async function POST(req: NextRequest) {
  try {
    // 1. Get the API Key from Headers (Best Practice)
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
    }

    const apiKey = authHeader.split(" ")[1]; // Remove "Bearer "

    // 2. Decrypt the Key to get the Hidden IDs
    // This throws an error if the key is fake or tampered with
    const { userId, workflowId, triggerNodeId } = decryptAPIKey(apiKey);

    // 3. Get the User Payload
    const body = await req.json();
    const { payload } = body; // User only sends payload now

    // 4. Execute
    const result = await triggerAPIWorkflow({
      userId,
      action: "run-task",
      workflowId,
      triggerNodeId,
      payload: payload || {}
    });

    return NextResponse.json({ success: true, result });

  } catch (err: any) {
    console.error("API Error:", err.message);
    return NextResponse.json({ error: "Invalid or expired API Key" }, { status: 401 });
  }
}