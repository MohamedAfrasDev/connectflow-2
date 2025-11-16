import type { NodeExecutor } from "@/features/executions/types";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import prisma from "@/lib/db";

import { createAnthropic} from "@ai-sdk/anthropic";
import { generateText} from "ai";


import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

type AnthropicData = {
  variableName?: string;
  systemPrompt?: string;
  credentialId?: string;

  userPrompt?: string;
};

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  context,
  nodeId,
  userId,
  step,
  publish,
}) => {
 await   publish(anthropicChannel().status({ nodeId, status:"loading" }));


 if(!data.variableName) {
  await publish(
    anthropicChannel().status({
      nodeId,
      status: "error"
    })
  );
  throw new NonRetriableError("Anthropic node: Variable name is missing")
 }
 if(!data.credentialId) {
  await publish(
    anthropicChannel().status({
      nodeId,
      status: "error"
    })
  );
  throw new NonRetriableError("Anthropic node:  Credential is missing")
 }
 if(!data.userPrompt) {
  await publish(
    anthropicChannel().status({
      nodeId,
      status: "error"
    })
  );
  throw new NonRetriableError("Anthropic node: User prompt is missing")
 }

 const systemPrompt = data.systemPrompt
 ? Handlebars.compile(data.systemPrompt)(context)
 : "You are a helpful assistant.";

 const userPrompt = Handlebars.compile(data.userPrompt)(context);

 

 const credential = await step.run("get-credential", () => {
  return prisma.credential.findUnique({
    where: {
      id: data.credentialId,
      userId
    },
  });
 });

 if(!credential) {
  throw new NonRetriableError("Gemini node: Credential not found");
 }

 const anthropic = createAnthropic({
  apiKey: credential.value
 });


 try {
  const { steps } = await step.ai.wrap(
    "anthropic-generate-text",
    generateText,
    {
      model: anthropic("claude-sonnet-4-5"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      }
    }
  );

  const text = steps[0].content[0].type === "text" ? steps[0].content[0].text : "";


  await publish(
    anthropicChannel().status({
      nodeId,
      status: "success"
    })
  );


  return {
    ...context,
    [data.variableName]: {
      text,        // <-- The property EVERY executor expects
    },
  };
  
 } catch (error){
  await publish(
    anthropicChannel().status({
      nodeId,
      status: "error"
    }),
  );
  throw error;
 }
};
