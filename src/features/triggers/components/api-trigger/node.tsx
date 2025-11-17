// /features/triggers/components/api-trigger/node.tsx
"use client";

import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { ManualTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { API_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/api-trigger";
import { fetchAPITriggerRealtimeToken } from "./action";

export const APITriggerNode = memo((props: NodeProps) => {
  console.log("MY REAL NODE ID IS:", props.id);
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: API_TRIGGER_CHANNEL_NAME,
    // ⚠️ FIX: This MUST be "status" to find the field inside the event data
    topic: "status", 
    refreshToken: fetchAPITriggerRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  return (
    <>
      <ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon="/logos/api.svg"
        name="API "
        description="Execute when API called"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});