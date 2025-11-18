"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { useNodeStatus } from "../../hooks/use-node-status";
import { LUMA_CHANNEL_NAME } from "@/inngest/channels/luma";
import { fetchLumaRealtimeToken } from "./action";
import { LumaFormValues, LumaDialog } from "./dialog";


type LumaNodeData = {
    webhookUrl?:string;
    content?: string;
    username?: string;
};

type LumaNodeType = Node<LumaNodeData>;

export const LumaNode = memo((props: NodeProps<LumaNodeType>) => {

    const [dialogOpen, setDialogOpen] = useState(false);
    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: LUMA_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchLumaRealtimeToken
    })
    const { setNodes } = useReactFlow();

    const handleSubmit = (values: LumaFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        variableName: values.variableName,   // <<< REQUIRED
                        webhookUrl: values.webhookUrl,
                        content: values.content,
                        username: values.username
                    }
                }
            }
            return node;
        }))
    }


    const handleOpenSettings = () => setDialogOpen(true);
    const nodeData = props.data;
    const description = nodeData?.content
        ? `Send : ${nodeData.content.slice(0,50)}...`
        : "Not configured";



    return (
        <>

            <LumaDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}

            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/luma.svg"
                name="Luma"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    );
});

LumaNode.displayName = "LumaNode";