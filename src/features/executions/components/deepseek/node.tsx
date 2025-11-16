"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { useNodeStatus } from "../../hooks/use-node-status";
import { DEEPSEEK_CHANNEL_NAME } from "@/inngest/channels/deepseek";
import { fetchDeepSeekRealtimeToken } from "./action";
import { DeepSeekDialog, DeepSeekFormValues } from "./dialog";

type DeepSeekNodeData = {
    variableName?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

type DeepSeekNodeType = Node<DeepSeekNodeData>;

export const DeepSeekNode = memo((props: NodeProps<DeepSeekNodeType>) => {

    const [dialogOpen, setDialogOpen] = useState(false);
    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: DEEPSEEK_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchDeepSeekRealtimeToken
    })
    const { setNodes } = useReactFlow();

    const handleSubmit = (values: DeepSeekFormValues) => {
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
        ? `deepseek-chat : ${nodeData.userPrompt.slice(0,50)}...`
        : "Not configured";



    return (
        <>

            <DeepSeekDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}

            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/deepseek.svg"
                name="DeepSeek"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    );
});

DeepSeekNode.displayName = "DeepSeekNode";