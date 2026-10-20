import { NextRequest, NextResponse } from "next/server";
import { triggerAPIWorkflow } from "@/inngest/workflows/api-trigger-workflow";
import { decryptAPIKey } from "@/lib/api-key";
import prisma from "@/lib/db";

const MAX_BODY_BYTES = 1_000_000;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
  }
  const apiKey = authHeader.slice("Bearer ".length).trim();

  let keyPayload: ReturnType<typeof decryptAPIKey>;
  try {
    keyPayload = decryptAPIKey(apiKey);
  } catch {
    return NextResponse.json({ error: "Invalid or expired API Key" }, { status: 401 });
  }
  const { userId, workflowId, triggerNodeId } = keyPayload;

  // The key must belong to the owner of the workflow (and the trigger node must
  // still exist in it), otherwise any user could run another user's workflow.
  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      userId,
      ...(triggerNodeId ? { nodes: { some: { id: triggerNodeId } } } : {}),
    },
    select: { id: true },
  });
  if (!workflow) {
    return NextResponse.json({ error: "Invalid or expired API Key" }, { status: 401 });
  }

  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    const body = raw ? JSON.parse(raw) : {};
    const payload =
      body && typeof body.payload === "object" && body.payload !== null && !Array.isArray(body.payload)
        ? body.payload
        : {};

    const result = await triggerAPIWorkflow({
      userId,
      action: "run-task",
      workflowId,
      triggerNodeId,
      payload,
    });

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("API trigger error:", err instanceof Error ? err.message : err);
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to trigger workflow" }, { status: 500 });
  }
}
