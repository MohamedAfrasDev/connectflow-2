import type { NodeExecutor } from "@/features/executions/types";

import { createGoogleGenerativeAI} from "@ai-sdk/google";
import { generateText} from "ai";


import Handlebars from "handlebars";
import { geminiChannel } from "@/inngest/channels/gemini";
import { NonRetriableError } from "inngest";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

type GeminiData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  context,
  nodeId,
  step,
  publish,
}) => {
 await   publish(geminiChannel().status({ nodeId, status:"loading" }));


 if(!data.variableName) {
  await publish(
    geminiChannel().status({
      nodeId,
      status: "error"
    })
  );
  throw new NonRetriableError("Gemini node: Variable name is missing")
 }

 if(!data.userPrompt) {
  await publish(
    geminiChannel().status({
      nodeId,
      status: "error"
    })
  );
  throw new NonRetriableError("Gemini node: USer prompt is missing")
 }

 const systemPrompt = data.systemPrompt
 ? Handlebars.compile(data.systemPrompt)(context)
 : "You are a helpful assistant.";

 const userPrompt = Handlebars.compile(data.userPrompt)(context);

 
 const credentialValue = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

 const google = createGoogleGenerativeAI({
  apiKey: credentialValue
 });


 try {
  const { steps } = await step.ai.wrap(
    "gemini-generate-text",
    generateText,
    {
      model: google("gemini-2.0-flash"),
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
    geminiChannel().status({
      nodeId,
      status: "success"
    })
  );


  return {
    ...context,
    [data.variableName]: {
    aiResponse: text,
  }
}
 } catch (error){
  await publish(
    geminiChannel().status({
      nodeId,
      status: "error"
    }),
  );
  throw error;
 }
};
