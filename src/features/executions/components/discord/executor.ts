import type { NodeExecutor } from "@/features/executions/types";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";


import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import { discordChannel } from "@/inngest/channels/discord";

import { decode } from "html-entities";
import ky from "ky";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

type DiscordData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};

export const discordExecutor: NodeExecutor<DiscordData> = async ({
  data,
  context,
  nodeId,
  step,
  publish,
}) => {
  await publish(discordChannel().status({ nodeId, status: "loading" }));




  if (!data.content) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error"
      })
    );
    throw new NonRetriableError("Discord node: Content is missing")
  }

  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);
  const username = data.username
    ? decode(Handlebars.compile(data.username)(context))
    : undefined;


  try {
    const result = await step.run("discord-webhook", async () => {
      if (!data.webhookUrl) throw new NonRetriableError("Discord node: Webhook URL is missing");
    
      let response;
      try {
        response = await ky.post(data.webhookUrl, {
          json: {
            content: content.slice(0, 2000),
            username,
          },
          throwHttpErrors: false, // we'll handle manually
          timeout: 10000,         // fail if Discord doesn't respond
        });
      } catch (err) {
        await publish(discordChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError(`Discord node: Request failed: ${err}`);
      }
    
      // Only accept exact 204 from Discord
      if (response.status !== 204) {
        await publish(discordChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError(
          `Discord node: Invalid webhook URL or Discord rejected message (status: ${response.status})`
        );
      }
    
      if (!data.variableName) throw new NonRetriableError("Discord node: Variable name is missing");
    
      return {
        ...context,
        [data.variableName]: { messageContent: content.slice(0, 2000) },
      };
    });
    


    await publish(
      discordChannel().status({
        nodeId,
        status: "success"
      })
    );


    return result;
  } catch (error) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error"
      }),
    );
    throw error;
  }
};
