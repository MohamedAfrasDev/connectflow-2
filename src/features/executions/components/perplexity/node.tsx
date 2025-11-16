"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { useNodeStatus } from "../../hooks/use-node-status";
import { PERPLEXITY_CHANNEL_NAME } from "@/inngest/channels/perplexity";
import { fetchPerplexityRealtimeToken } from "./action";
import { PerplexityDialog, PerplexityFormValues } from "./dialog";

type PerplexityNodeData = {
    variableName?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

type PerplexityNodeType = Node<PerplexityNodeData>;

export const PerlexityNode = memo((props: NodeProps<PerplexityNodeType>) => {

    const [dialogOpen, setDialogOpen] = useState(false);
    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: PERPLEXITY_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchPerplexityRealtimeToken
    })
    const { setNodes } = useReactFlow();

    const handleSubmit = (values: PerplexityFormValues) => {
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
        ? `sonar : ${nodeData.userPrompt.slice(0,50)}...`
        : "Not configured";



    return (
        <>

            <PerplexityDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}

            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/perplexity.svg"
                name="Perplexity"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    );
});

PerlexityNode.displayName = "PerlexityNode";