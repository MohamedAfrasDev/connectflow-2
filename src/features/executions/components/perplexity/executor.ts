import type { NodeExecutor } from "@/features/executions/types";
import { perplexityChannel } from "@/inngest/channels/perplexity";
import prisma from "@/lib/db";

import { createPerplexity} from "@ai-sdk/perplexity";
import { generateText} from "ai";


import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

type PerplexityData = {
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
  credentialId?:string;
};

export const perplexityExecutor: NodeExecutor<PerplexityData> = async ({
  data,
  context,
  nodeId,
  step,
  publish,
}) => {
 await   publish(perplexityChannel().status({ nodeId, status:"loading" }));


 if(!data.variableName) {
  await publish(
    perplexityChannel().status({
      nodeId,
      status: "error"
    })
  );
  throw new NonRetriableError("Perplexity node: Variable name is missing")
 }
 if(!data.credentialId) {
  await publish(
    perplexityChannel().status({
      nodeId,
      status: "error"
    })
  );
  throw new NonRetriableError("Perplexity node: Credential is missing")
 }

 if(!data.userPrompt) {
  await publish(
    perplexityChannel().status({
      nodeId,
      status: "error"
    })
  );
  throw new NonRetriableError("Perplexity node: USer prompt is missing")
 }

 const systemPrompt = data.systemPrompt
 ? Handlebars.compile(data.systemPrompt)(context)
 : "You are a helpful assistant.";

 const userPrompt = Handlebars.compile(data.userPrompt)(context);

 
 const credential = await step.run("get-credential", () => {
  return prisma.credential.findUnique({
    where: {
      id: data.credentialId,
    },
  });
 });

 if(!credential) {
  throw new NonRetriableError("Perplexity node: Credential not found");
 }

 const perplexity = createPerplexity({
  apiKey: credential.value
 });


 try {
  const { steps } = await step.ai.wrap(
    "perplexity-generate-text",
    generateText,
    {
      model: perplexity("sonar"),
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
    perplexityChannel().status({
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
    perplexityChannel().status({
      nodeId,
      status: "error"
    }),
  );
  throw error;
 }
};
