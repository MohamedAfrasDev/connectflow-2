import type { NodeExecutor } from "@/features/executions/types";
import { deepSeekChannel } from "@/inngest/channels/deepseek";
import prisma from "@/lib/db";

import { createDeepSeek} from "@ai-sdk/deepseek";
import { generateText} from "ai";


import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

type DeepSeekData = {
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
  credentialId?: string;
};

export const deepSeekExecutor: NodeExecutor<DeepSeekData> = async ({
  data,
  context,
  userId,
  nodeId,
  step,
  publish,
}) => {
 await   publish(deepSeekChannel().status({ nodeId, status:"loading" }));


 if(!data.variableName) {
  await publish(
    deepSeekChannel().status({
      nodeId,
      status: "error"
    })
  );
  throw new NonRetriableError("DeepSeek node: Variable name is missing")
 }
 if(!data.credentialId) {
  await publish(
    deepSeekChannel().status({
      nodeId,
      status: "error"
    })
  );
  throw new NonRetriableError("DeepSeek node: Credential is missing")
 }

 if(!data.userPrompt) {
  await publish(
    deepSeekChannel().status({
      nodeId,
      status: "error"
    })
  );
  throw new NonRetriableError("DeepSeek node: User prompt is missing")
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
  throw new NonRetriableError("DeepSeek node: Credential not found");
 }

 
 const deepseek = createDeepSeek({
  apiKey: credential.value
 });


 try {
  const { steps } = await step.ai.wrap(
    "deepseek-generate-text",
    generateText,
    {
      model: deepseek("deepseek-chat"),
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
    deepSeekChannel().status({
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
    deepSeekChannel().status({
      nodeId,
      status: "error"
    }),
  );
  throw error;
 }
};
