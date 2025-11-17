"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { useNodeStatus } from "../../hooks/use-node-status";
import { GMAIL_CHANNEL_NAME } from "@/inngest/channels/gmail";
import { fetchGmailRealtimeToken } from "./action";
import { GmailDialog, GmailFormValues } from "./dialog";

type GmailNodeData = {
  variableName?: string;
  credentialId?: string;
  to?: string;
  subject?: string;
  body?: string;
};

type GmailNodeType = Node<GmailNodeData>;

interface Props extends NodeProps<GmailNodeType> {
  credentials: { id: string; name: string }[];
}

export const GmailNode = memo(({ credentials, ...props }: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GMAIL_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGmailRealtimeToken,
  });

  const { setNodes } = useReactFlow();

  const handleSubmit = (values: GmailFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              variableName: values.variableName,
              credentialId: values.credentialId,
              to: values.to,
              subject: values.subject,
              body: values.body,
            },
          };
        }
        return node;
      })
    );
  };

  const handleOpenSettings = () => setDialogOpen(true);

  const nodeData = props.data;
  const description = nodeData?.to
    ? `Sending to: ${nodeData.to}`
    : "Not configured";

  return (
    <>
      <GmailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/gmail.svg"
        name="Gmail"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

GmailNode.displayName = "GmailNode";
