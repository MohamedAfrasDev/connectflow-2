import { credentialsRouter } from '@/features/credentials/server/router';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';

import { workflowsRouter } from '@/features/workflows/server/route';
import { executionsRouter } from '@/features/executions/server/router';
export const appRouter = createTRPCRouter({
workflows: workflowsRouter,
credentials: credentialsRouter,
executions: executionsRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;