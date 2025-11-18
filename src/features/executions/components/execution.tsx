
"use client";
import { ExecutionStatus } from "@/generated/prisma/enums";
import { CheckCircle2Icon, XCircleIcon, Loader2Icon, ClockIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useSuspenseExecution } from "../hooks/use-execution";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
        case ExecutionStatus.SUCCESS:
            return <CheckCircle2Icon className="size-5 text-green-600" />;

        case ExecutionStatus.FAILED:
            return <XCircleIcon className="size-5 text-red-600" />;

        case ExecutionStatus.RUNNING:
            return <Loader2Icon className="size-5 text-blue-600 animate-spin" />;

        default:
            return <ClockIcon className="size-5 text-muted-foreground" />;
    }
}


const formatStatus = (status: ExecutionStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase()
};


export const ExecutionView = ({
    executionId
}: {
    executionId: string
}) => {
    const { data: execution } = useSuspenseExecution(executionId);
    const [showStackTrace, setShoStackTrace] = useState(false);

    const duration = execution?.completedAt && execution?.startedAt
        ? Math.round(
            (new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000
        )
        : null;


    return (
        <Card className="shadow-none">
            <CardHeader>
                <div className="flex items-center gap-3">
                    {getStatusIcon(execution!.status)}
                </div>
                <CardTitle>
                    {formatStatus(execution!.status)}
                </CardTitle>
                <CardDescription>
                    Execution for {execution!.workflow.name}
                </CardDescription>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Workflow
                            </p>

                            <Link href={`/workflows/${execution!.workflowId}`} prefetch className="text-sm hover:underline text-primary">
                                {execution!.workflow.name}
                            </Link>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <p className="text-sm">{formatStatus(execution!.status)}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Started</p>
                            <p className="text-sm">{formatDistanceToNow(execution!.startedAt, { addSuffix: true })}</p>
                        </div>


                        {execution?.completedAt && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                <p className="text-sm">{formatDistanceToNow(execution!.completedAt, { addSuffix: true })}</p>
                            </div>
                        )}

                        {duration !== null && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Durations</p>
                                <p className="text-sm">{duration}s</p>
                            </div>
                        )}

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Event ID</p>
                            <p className="text-sm">{execution!.inngestEventId}</p>
                        </div>
</div>
                  
                            {execution!.error && (

                                <div className="mt-6 p-4 bg-red-50 rounded-md-space-y-3">
                                    <div className="text-sm font-medium text-red-900">
                                        <p className="text-sm font-medium text-red-900 mb-2">
                                            Error
                                        </p>
                                        <p className="text-sm font-medium font-mono">
                                            {execution!.error}
                                        </p>
                                    </div>
                                    {execution!.errorStack && (
                                <Collapsible
                                    open={showStackTrace}
                                    onOpenChange={setShoStackTrace}
                                >
                                    <CollapsibleTrigger asChild
                                    >

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-900 hover:bg-red-100"
                                        >
                                            {showStackTrace
                                                ? "Hide stack trace"
                                                : "Show stack trace"}
                                        </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <pre className="text-xs font-mono text-red-800 overflow-auto mt-2 p-2 bg-re-100 rounded">
                                            {execution!.errorStack}
                                        </pre></CollapsibleContent>
                                </Collapsible>
                            )}

  
                                </div>



                            )}
                      
{execution!.output && (
    <div className="mt-6 p-4 bg-muted rounded-sm">
        <p className="text-sm font-medium mb-2">Output</p>
        <pre className="text-xs font-mono overflow-auto">
            {JSON.stringify(execution!.output, null, 2)}
        </pre>
    </div>
)}

                </CardContent>
            </CardHeader>
        </Card>
    )
}