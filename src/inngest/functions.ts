import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import { ExecutionStatus, NodeType } from "@/generated/prisma/enums";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { geminiChannel } from "./channels/gemini";
import { openAIChannel } from "./channels/openai";
import { anthropicChannel } from "./channels/anthropic";
import { deepSeekChannel } from "./channels/deepseek";
import { perplexityChannel } from "./channels/perplexity";
import { discordChannel } from "./channels/discord";
import { gmailChannel } from "./channels/gmail";
import { apiTriggerChannel } from "./channels/api-trigger";
import { customMailChannel } from "./channels/custom_mail";
import { instagramChannel } from "./channels/instagram";
import { lumaChannel } from "./channels/luma";



export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: process.env.NODE_ENV === "production" ? 3 : 0,
    onFailure: async ({ event, step }) => {
      return prisma.execution.update({
        where: { inngestEventId: event.data.event.id },
        data: {
          status: ExecutionStatus.FAILED,
          error: event.data.error.message,
          errorStack: event.data.error.stack
        }
      })
    }
  },
  {
    event: "workflow/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      openAIChannel(),
      anthropicChannel(),
      deepSeekChannel(),
      perplexityChannel(),
      discordChannel(),
      gmailChannel(),
      apiTriggerChannel(),
      customMailChannel(),
      instagramChannel(),
      lumaChannel(),
    ]
  },
  async ({ event, step, publish }) => {
    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;


    if (!inngestEventId) {
      throw new NonRetriableError("Inngest ID is missing");
    }


    if (!inngestEventId || !workflowId) {
      throw new NonRetriableError("Workflow ID is missing");
    }

    await step.run("create-execution", async () => {
      return prisma.execution.create({
        data: {
          workflowId,
          inngestEventId,
        },
      });
    });

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true
        }
      });

      return topologicalSort(workflow.nodes, workflow.connections)

    });

    const userId = await step.run("find-user-id", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        select: {
          userId: true,
        }
      });

      return workflow.userId;
    });


    // FIX: support both initialData and api and preserve all event data
    // Build ONLY real context, without polluting it with event-level fields
    // FIX: support both initialData and api properly
    let context: Record<string, any> = {
      ...(event.data.initialData ?? {}),
    };

    if (event.data.api && Object.keys(event.data.api).length) {
      context.api = event.data.api;
    }

    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        userId,
        context,
        step,
        publish,
      });
    }


    await step.run("update-execution", async () => {
      return prisma.execution.update({
        where: { inngestEventId, workflowId },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context,
        }
      })
    })
  }
);