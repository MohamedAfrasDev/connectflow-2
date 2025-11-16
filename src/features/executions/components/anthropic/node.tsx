"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchAnthropicRealtimeToken } from "./action";
import { ANTHROPIC_CHANNEL_NAME } from "@/inngest/channels/anthropic";
import { AnthropicDialog, AnthropicFormValues } from "./dialog";

type AnthroipcNodeData = {
    variableName?: string;
    systemPrompt?: string;
    userPrompt?: string;
    credentialId?: string;
};

type AnthropicNodeType = Node<AnthroipcNodeData>;

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => {

    const [dialogOpen, setDialogOpen] = useState(false);
    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: ANTHROPIC_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchAnthropicRealtimeToken
    })
    const { setNodes } = useReactFlow();

    const handleSubmit = (values: AnthropicFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        variableName: values.variableName,   // <<< REQUIRED
                        credentialId: values.credentialId,
                        systemPrompt: values.systemPrompt,
                        userPrompt: values.userPrompt
                    }
                }
            }
            return node;
        }))
    }


    const handleOpenSettings = () => setDialogOpen(true);
    const nodeData = props.data;
    const description = nodeData?.userPrompt
        ? `claude-sonnet-4-5 : ${nodeData.userPrompt.slice(0, 50)}...`
        : "Not configured";



    return (
        <>

            <AnthropicDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}

            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/anthropic.svg"
                name="Anthropic"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    );
});

AnthropicNode.displayName = "AnthropicNode";