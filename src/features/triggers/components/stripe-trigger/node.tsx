import { NodeProps} from "@xyflow/react";

import { memo, useState} from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import {  StripeTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { GOOGLE_FORM_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/google-form-trigger";
import {  fetchStripeTriggerRealtimeToken } from "./action";
import { STRIPE_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/stripe-trigger";


export const StripeTriggerNode = memo((props: NodeProps) => {

    const [dialogOpen, setDialogOpen] = useState(false);


    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: STRIPE_TRIGGER_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchStripeTriggerRealtimeToken
    })
    const handleOpenSettings = () => setDialogOpen(true);
    return (
        <>
        <StripeTriggerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        />
        <BaseTriggerNode
        {...props}
        icon="/logos/stripe.svg"
        name="Stripe Event"
        description="When stripe event is captured"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        />
        </>
    )
});