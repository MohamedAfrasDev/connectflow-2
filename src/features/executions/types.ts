// src/features/executions/types.ts

import type { GetStepTools, Inngest } from "inngest";
import { Realtime } from "@inngest/realtime";

// 1. IMPORT TYPES FROM PRISMA (Use 'type' keyword for safety)
import type { Execution as PrismaExecution, ExecutionStatus as PrismaExecutionStatus } from "@/generated/prisma/client";

// 2. Re-export basic Prisma types with clean names
export type Execution = PrismaExecution;
export type ExecutionStatus = PrismaExecutionStatus;

// 3. Re-export other utility types
export type WorkflowContext = Record<string, unknown>;
export type StepTools = GetStepTools<Inngest.Any>;

// 4. Define the complex type used for the list item (Executiontem)
export type ExecutionWithWorkflow = Execution & {
    workflow: {
        id: string;
        name: string;
    }
};

// 5. Define utility interfaces (no changes needed here, just for completeness)
export interface NodeExecutorParams<TData = Record<string, unknown>> {
    data: TData;
    nodeId: string;
    userId: string;
    context: WorkflowContext;
    step: StepTools;
    publish: Realtime.PublishFn;
};

export type NodeExecutor<TData = Record<string, unknown>> = (
    params: NodeExecutorParams<TData>,
) => Promise<WorkflowContext>;