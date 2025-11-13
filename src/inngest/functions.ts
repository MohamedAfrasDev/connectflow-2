import { inngest } from "./client";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import * as Sentry from "@sentry/nextjs";


const google = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createGoogleGenerativeAI();

export const execute = inngest.createFunction(
  { id: "execute" },
  { event: "execute/ai" },
  async ({ event, step }) => {

    await step.sleep("pretend","5s");

    Sentry.logger.info('User triggered test log', { log_source: 'sentry_test' });

    console.warn("Something is missing");
    console.error("This is an error I want to track");
  const { steps: geminiSteps } = await step.ai.wrap("gemini-genrate-text",
    generateText, {
      model: google("gemini-2.5-flash"),
      system: "You are a helpful assistant",
      prompt:"What is 2+2 ?",
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      }
    }
  );

  const { steps: openaiSteps } = await step.ai.wrap("openai-genrate-text",
    generateText, {
      model: openai("gpt-4"),
      system: "You are a helpful assistant",
      prompt:"What is 2+2 ?",
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      }
    }
  );
  const { steps: anthropicSteps } = await step.ai.wrap("anhtropic-genrate-text",
    generateText, {
      model: anthropic("claude-sonnet-4-5"),
      system: "You are a helpful assistant",
      prompt:"What is 2+2 ?",
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      }
    }
  );
  return {
    geminiSteps,
    openaiSteps,
    anthropicSteps,
  };
  },
);