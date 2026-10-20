import { NonRetriableError } from "inngest";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { ExecutionStatus, type NodeType } from "@/generated/prisma";
import prisma from "@/lib/db";
import { anthropicChannel } from "./channels/anthropic";
import { apiTriggerChannel } from "./channels/api-trigger";
import { customMailChannel } from "./channels/custom_mail";
import { deepSeekChannel } from "./channels/deepseek";
import { discordChannel } from "./channels/discord";
import { geminiChannel } from "./channels/gemini";
import { gmailChannel } from "./channels/gmail";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { httpRequestChannel } from "./channels/http-request";
import { instagramChannel } from "./channels/instagram";
import { lumaChannel } from "./channels/luma";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { openAIChannel } from "./channels/openai";
import { perplexityChannel } from "./channels/perplexity";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { inngest } from "./client";
import { topologicalSort } from "./utils";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: process.env.NODE_ENV === "production" ? 3 : 0,
    onFailure: async ({ event, step }) => {
      // Ensure we catch failures and mark execution as FAILED
      if (!event?.data?.event?.id) return;
      return prisma.execution.update({
        where: { inngestEventId: event.data.event.id },
        data: {
          status: ExecutionStatus.FAILED,
          error: event.data.error?.message ?? "Unknown error",
          errorStack: event.data.error?.stack ?? "",
        },
      });
    },
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
    ],
  },
  async ({ event, step, publish }) => {
    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;

    if (!inngestEventId) {
      throw new NonRetriableError("Inngest ID is missing");
    }

    if (!workflowId) {
      throw new NonRetriableError("Workflow ID is missing");
    }

    // 1️⃣ Create execution record
    await step.run("create-execution", async () => {
      return prisma.execution.create({
        data: {
          workflowId,
          inngestEventId,
        },
      });
    });

    // 2️⃣ Load workflow once: sort nodes topologically and extract userId together
    const { sortedNodes, userId } = await step.run(
      "prepare-workflow",
      async () => {
        const workflow = await prisma.workflow.findUniqueOrThrow({
          where: { id: workflowId },
          include: {
            nodes: true,
            connections: true,
          },
        });

        return {
          sortedNodes: topologicalSort(workflow.nodes, workflow.connections),
          userId: workflow.userId,
        };
      },
    );

    // 3️⃣ Build execution context
    // biome-ignore lint/suspicious/noExplicitAny: context is arbitrary JSON shared between node executors
    let context: Record<string, any> = { ...(event.data.initialData ?? {}) };
    if (event.data.api && Object.keys(event.data.api).length) {
      context.api = event.data.api;
    }

    // 4️⃣ Execute each node
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

    // 5️⃣ Update execution status
    await step.run("update-execution", async () => {
      return prisma.execution.update({
        where: { inngestEventId, workflowId },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context,
        },
      });
    });
  },
);
