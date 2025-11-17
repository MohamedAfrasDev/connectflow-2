"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { useNodeStatus } from "../../hooks/use-node-status";
import { GMAIL_CHANNEL_NAME } from "@/inngest/channels/gmail";
import { fetchCustomMailRealtimeToken } from "./action";
import { CUSTOM_MAIL_CHANNEL_NAME } from "@/inngest/channels/custom_mail";
import { CustomMailDialog, CustomMailFormValues } from "./dialog";

type CustomMailNodeData = {
  variableName?: string;
  credentialId?: string;
  to?: string;
  subject?: string;
  body?: string;
};

type CustomMailNodeType = Node<CustomMailNodeData>;

interface Props extends NodeProps<CustomMailNodeType> {
  credentials: { id: string; name: string }[];
}

export const CustomMailNode = memo(({ credentials, ...props }: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: CUSTOM_MAIL_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchCustomMailRealtimeToken,
  });

  const { setNodes } = useReactFlow();

  const handleSubmit = (values: CustomMailFormValues) => {
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
      <CustomMailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/email.svg"
        name="Custom Mail"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

CustomMailNode.displayName = "CustomMailNode";
