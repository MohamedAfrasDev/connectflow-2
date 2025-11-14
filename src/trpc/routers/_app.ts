import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';

import { workflowsRouter } from '@/features/workflows/server/route';
export const appRouter = createTRPCRouter({
workflows: workflowsRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;