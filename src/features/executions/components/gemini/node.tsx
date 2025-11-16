"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { AVAILABLE_MODELS, GeminiDialog, GeminiFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import  { HTTP_REQUEST_CHANNEL_NAME } from "@/inngest/channels/http-request";
import { GEMINI_CHANNEL_NAME } from "@/inngest/channels/gemini";
import { fetchGeminiRealtimeToken } from "./action";

type GeminiNodeData = {
    variableName?: string;
    model?: any;
    systemPrompt?: string;
    userPrompt?: string;
};

type GeminiNodeType = Node<GeminiNodeData>;

export const GeminiNode = memo((props: NodeProps<GeminiNodeType>) => {

    const [dialogOpen, setDialogOpen] = useState(false);
    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: GEMINI_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchGeminiRealtimeToken
    })
    const { setNodes } = useReactFlow();

    const handleSubmit = (values: GeminiFormValues) => {
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
        ? `${nodeData.model || AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(0,50)}...`
        : "Not configured";



    return (
        <>

            <GeminiDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}

            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/gemini.svg"
                name="Gemini"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    );
});

GeminiNode.displayName = "GeminiNode";