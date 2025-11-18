// node.tsx
"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { InstagramDialog, InstagramFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchInstagramRealtimeToken } from "./action";
import { INSTAGRAM_CHANNEL_NAME } from "@/inngest/channels/instagram";

type InstagramNodeData = {
  credentialId?: string;
  variableName?: string;
  caption?: string;
  imageUrl?: string;
  publishType?: "IMAGE" | "VIDEO";
};

type InstagramNodeType = Node<InstagramNodeData>;

export const InstagramNode = memo((props: NodeProps<InstagramNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: INSTAGRAM_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchInstagramRealtimeToken,
  });

  const { setNodes } = useReactFlow();

  const handleSubmit = (values: InstagramFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              variableName: values.variableName,
              credentialId: values.credentialId,
              caption: values.caption,
              imageUrl: values.imageUrl,
              publishType: values.publishType || "IMAGE",
            },
          };
        }
        return node;
      })
    );
  };

  const handleOpenSettings = () => setDialogOpen(true);
  const nodeData = props.data;
  const description = nodeData?.caption ? `Caption: ${nodeData.caption.slice(0, 50)}...` : "Not configured";

  return (
    <>
      <InstagramDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/instagram.svg"
        name="Instagram (Business)"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

InstagramNode.displayName = "InstagramNode";
