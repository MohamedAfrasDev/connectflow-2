import { credentialsRouter } from '@/features/credentials/server/router';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';

import { workflowsRouter } from '@/features/workflows/server/route';
export const appRouter = createTRPCRouter({
workflows: workflowsRouter,
credentials: credentialsRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;