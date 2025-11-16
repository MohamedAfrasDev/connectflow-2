import type { NodeExecutor } from "@/features/executions/types";
import { openAIChannel } from "@/inngest/channels/openai";
import prisma from "@/lib/db";

import { createOpenAI} from "@ai-sdk/openai";
import { generateText} from "ai";


import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

type OpenAIData = {
  variableName?: string;
  systemPrompt?: string;
  credentialId?: string;
  userPrompt?: string;
};

export const openAIExecutor: NodeExecutor<OpenAIData> = async ({
  data,
  context,
  nodeId,
  userId,
  step,
  publish,
}) => {
 await   publish(openAIChannel().status({ nodeId, status:"loading" }));


 if(!data.variableName) {
  await publish(
    openAIChannel().status({
      nodeId,
      status: "error"
    })
  );
  throw new NonRetriableError("OpenAI node: Variable name is missing")
 }

 if(!data.credentialId) {
  await publish(
    openAIChannel().status({
      nodeId,
      status: "error"
    })
  );
  throw new NonRetriableError("OpenAI node: Credential is missing")
 }

 if(!data.userPrompt) {
  await publish(
    openAIChannel().status({
      nodeId,
      status: "error"
    })
  );
  throw new NonRetriableError("OpenAI node: User prompt is missing")
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

 
 const openai = createOpenAI({
  apiKey: credential.value
 });


 try {
  const { steps } = await step.ai.wrap(
    "openai-generate-text",
    generateText,
    {
      model: openai("gpt-3.5-turbo"),
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
    openAIChannel().status({
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
    openAIChannel().status({
      nodeId,
      status: "error"
    }),
  );
  throw error;
 }
};
