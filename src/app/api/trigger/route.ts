// app/api/trigger/route.ts
import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 👇 EXTRACT BOTH IDs
    const { userId, action, payload, workflowId, triggerNodeId } = body;

    const nodeId = `node-${Date.now()}`;

    const result = await inngest.send({
      name: "workflow/execute.workflow", 
      data: { 
        userId, 
        action, 
        payload, 
        nodeId,
        workflowId,     // Passed to find workflow in DB
        triggerNodeId   // Passed to update UI status
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}