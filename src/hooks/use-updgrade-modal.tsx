import { TRPCClientError } from "@trpc/client";
import { useState } from "react";
import { UpdgradeModal } from "@/components/upgrade-modal";

export const useUpdgradeModal = () => {
    const [open, setOpen] = useState(false);

    const handleError = (error: unknown) => {
        if(error instanceof TRPCClientError) {
            if(error.data?.code==="FORBIDDEN") {
                setOpen(true);
                return true;
            }
        }
        return false;
    };

    const modal = <UpdgradeModal open={open} onOpenChange={setOpen}/>;

    return { handleError, modal};
}