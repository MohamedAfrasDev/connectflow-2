import type { NodeExecutor } from "@/features/executions/types";

import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import ky from "ky";
import { lumaChannel } from "@/inngest/channels/luma";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

type LumaData = {
  variableName?: string;
  apiCredentialId?: string;
  imagePrompt?: string;
  imageCount?: string;
  imageSize?: string;
};

/** Luma Dream Machine image-generation executor.
 *
 *  Flow:
 *  1. POST to /dream-machine/v1/generations/image to start the job.
 *  2. Poll /dream-machine/v1/generations/{id} every 5 s until state is
 *     "completed" or "failed" (max ~2 min).
 *  3. Return the first output image URL in the workflow context.
 */
export const lumaExecutor: NodeExecutor<LumaData> = async ({
  data,
  context,
  nodeId,
  userId,
  step,
  publish,
}) => {
  await publish(lumaChannel().status({ nodeId, status: "loading" }));

  // --- Validation ---
  if (!data.variableName) {
    await publish(lumaChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Luma node: Variable name is missing");
  }
  if (!data.apiCredentialId) {
    await publish(lumaChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Luma node: API credential is missing");
  }
  if (!data.imagePrompt) {
    await publish(lumaChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Luma node: Image prompt is missing");
  }

  // --- Load credential ---
  const credential = await step.run("luma-get-credential", async () => {
    return prisma.credential.findUnique({
      where: { id: data.apiCredentialId, userId },
      select: { value: true },
    });
  });

  if (!credential?.value) {
    await publish(lumaChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Luma node: Credential not found or missing API key");
  }

  const apiKey = credential.value;

  // --- Compile prompt template ---
  const compiledPrompt = Handlebars.compile(data.imagePrompt)(context);

  try {
    // 1️⃣ Start image generation job
    const generationId = await step.run("luma-start-generation", async () => {
      const res = await ky.post(
        "https://api.lumalabs.ai/dream-machine/v1/generations/image",
        {
          headers: { Authorization: `Bearer ${apiKey}` },
          json: {
            prompt: compiledPrompt,
            ...(data.imageSize ? { image_size: data.imageSize } : {}),
          },
          throwHttpErrors: false,
          timeout: 30000,
        }
      );

      const json = (await res.json()) as { id?: string; error?: unknown };
      if (!json.id) {
        throw new NonRetriableError(
          `Luma node: Failed to start generation. ${JSON.stringify(json.error)}`
        );
      }
      return json.id;
    });

    // 2️⃣ Poll until the job is done (max ~2 minutes, 5 s intervals)
    const outputUrl = await step.run("luma-poll-generation", async () => {
      const MAX_POLLS = 24; // 24 × 5 s = 120 s
      for (let i = 0; i < MAX_POLLS; i++) {
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const pollRes = await ky.get(
          `https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`,
          {
            headers: { Authorization: `Bearer ${apiKey}` },
            throwHttpErrors: false,
            timeout: 15000,
          }
        );

        const pollJson = (await pollRes.json()) as {
          state?: string;
          assets?: { image?: string };
          failure_reason?: string;
        };

        if (pollJson.state === "completed") {
          const url = pollJson.assets?.image;
          if (!url) {
            throw new NonRetriableError("Luma node: Generation completed but no image URL returned");
          }
          return url;
        }

        if (pollJson.state === "failed") {
          throw new NonRetriableError(
            `Luma node: Generation failed — ${pollJson.failure_reason ?? "unknown reason"}`
          );
        }
      }

      throw new NonRetriableError("Luma node: Generation timed out after 120 seconds");
    });

    await publish(lumaChannel().status({ nodeId, status: "success" }));

    return {
      ...context,
      [data.variableName]: {
        imageUrl: outputUrl,
        prompt: compiledPrompt,
        generationId,
      },
    };
  } catch (error) {
    await publish(lumaChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
