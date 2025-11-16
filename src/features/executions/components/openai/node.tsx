"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import {   OpenAIDialog, OpenAIFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchOpenAIRealtimeToken } from "./action";
import { OPENAI_CHANNEL_NAME } from "@/inngest/channels/openai";

type OpenAINodeData = {
    variableName?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

type OpenAINodeType = Node<OpenAINodeData>;

export const OpenAINode = memo((props: NodeProps<OpenAINodeType>) => {

    const [dialogOpen, setDialogOpen] = useState(false);
    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: OPENAI_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchOpenAIRealtimeToken
    })
    const { setNodes } = useReactFlow();

    const handleSubmit = (values: OpenAIFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        variableName: values.variableName,   // <<< REQUIRED

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
        ? `gpt-3.5-turbo : ${nodeData.userPrompt.slice(0,50)}...`
        : "Not configured";



    return (
        <>

            <OpenAIDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}

            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/openai.svg"
                name="OpenAI"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    );
});

OpenAINode.displayName = "OpenAINode";