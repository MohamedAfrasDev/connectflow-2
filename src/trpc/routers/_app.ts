import { z } from 'zod';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
import prisma from '@/lib/db';
import { inngest } from '@/inngest/client';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { TRPCError } from '@trpc/server';
export const appRouter = createTRPCRouter({
  testAi: baseProcedure.mutation(async() => {

    throw new TRPCError({ code: "BAD_REQUEST", message: "Something went wrong"});
    await inngest.send({
      name: "execute/ai",
    });

    return { success: true, message: "Job queued"}
  }),
  getWorkflows: protectedProcedure.query(({ ctx }) => {
    return prisma.workflow.findMany({})

  }),
  createWorkflow: protectedProcedure.mutation(async () => {

    await inngest.send({
      name: "test/hello.world",
      data: {
        email: 'afras@gmial.com'
      },
    });

    return prisma.workflow.create({
      data: {
        name: "test-workflow"
      }
    })
  })
});
// export type definition of API
export type AppRouter = typeof appRouter;