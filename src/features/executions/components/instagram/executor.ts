// executor.ts
import type { NodeExecutor } from "@/features/executions/types";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import ky from "ky";
import { instagramChannel } from "@/inngest/channels/instagram";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

export type InstagramData = {
  variableName?: string;
  credentialId?: string;
  caption?: string;
  imageUrl?: string;
};

export const instagramExecutor: NodeExecutor<InstagramData> = async ({
  data,
  context,
  nodeId,
  userId,
  step,
  publish,
}) => {
  await publish(instagramChannel().status({ nodeId, status: "loading" }));

  if (!data.variableName) {
    await publish(instagramChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Instagram node: Variable name is missing");
  }
  if (!data.credentialId) {
    await publish(instagramChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Instagram node: Credential ID is missing");
  }
  if (!data.imageUrl) {
    await publish(instagramChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Instagram node: Image URL is missing");
  }

  // Load credential — access token is stored in `value`, business ID in its own column.
  const credential = await step.run("get-credential", async () => {
    return prisma.credential.findUnique({
      where: { id: data.credentialId, userId },
      select: { value: true, instagramBusinessId: true },
    });
  });

  if (!credential?.value || !credential.instagramBusinessId) {
    await publish(instagramChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError(
      "Instagram node: Credential not found or missing accessToken / instagramBusinessId"
    );
  }

  const accessToken = credential.value;
  const instagramBusinessId = credential.instagramBusinessId;

  // Compile templates
  const compiledImageUrl = Handlebars.compile(data.imageUrl)(context);
  const compiledCaption = data.caption ? Handlebars.compile(data.caption)(context) : "";

  try {
    const result = await step.run("instagram-create-and-publish", async () => {
      // 1️⃣ Create media container
      const creationRes = await ky.post(
        `https://graph.facebook.com/v16.0/${instagramBusinessId}/media`,
        {
          searchParams: {
            image_url: compiledImageUrl,
            caption: compiledCaption,
            access_token: accessToken,
          },
          throwHttpErrors: false,
          timeout: 20000,
        }
      );

      const creationJson = (await creationRes.json()) as { id?: string; error?: unknown };
      if (!creationJson.id) {
        throw new NonRetriableError(
          `Instagram node: Failed to create media container. ${JSON.stringify(creationJson.error)}`
        );
      }
      const creationId = creationJson.id;

      // 2️⃣ Publish media
      const publishRes = await ky.post(
        `https://graph.facebook.com/v16.0/${instagramBusinessId}/media_publish`,
        {
          searchParams: {
            creation_id: creationId,
            access_token: accessToken,
          },
          throwHttpErrors: false,
          timeout: 20000,
        }
      );

      const publishJson = (await publishRes.json()) as { id?: string; error?: unknown };
      if (!publishJson.id) {
        throw new NonRetriableError(
          `Instagram node: Failed to publish media. ${JSON.stringify(publishJson.error)}`
        );
      }

      return {
        ...context,
        [data.variableName!]: {
          success: true,
          creationId,
          postId: publishJson.id,
        },
      };
    });

    await publish(instagramChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (err) {
    await publish(instagramChannel().status({ nodeId, status: "error" }));
    throw err;
  }
};
