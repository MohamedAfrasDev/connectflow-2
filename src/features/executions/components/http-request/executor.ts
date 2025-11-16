import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

import Handlebars from "handlebars";
import { httpRequestChannel } from "@/inngest/channels/http-request";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

type HttpRequestData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  context,
  nodeId,
  step,
  publish,
}) => {
  const send = (status: "loading" | "success" | "error") =>
    publish(httpRequestChannel().status({ nodeId, status }));

  await send("loading");


  try {
    const result = await step.run("http-request", async () => {
      if (!data.endpoint?.trim()) {
        await send("error");
        throw new NonRetriableError(
          "HTTP Request node: No endpoint configured (empty string)."
        );
      }
    
      if (!data.variableName) {
        await send("error");
        throw new NonRetriableError("HTTP Request node: Variable name missing.");
      }
    
      if (!data.method) {
        await send("error");
        throw new NonRetriableError("HTTP Request node: HTTP method missing.");
      }
    
      // ---------- HANDLEBARS RESOLUTION ----------
      const interpolate = (template: string) => {
        const compiled = Handlebars.compile(template);
        const output = compiled(context);

        if (!output || output.trim() === "") {
          throw new NonRetriableError(
            `Template resolved to empty string:\n${template}\n` +
              `→ Missing variable in context?`
          );
        }

        return output;
      };

      let endpoint = interpolate(data.endpoint);

      // ---------- RELATIVE URL FIX ----------
      if (!endpoint.startsWith("http://") && !endpoint.startsWith("https://")) {
        const base =
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        endpoint = base + (endpoint.startsWith("/") ? endpoint : "/" + endpoint);
      }

      // Final absolute URL check
      try {
        new URL(endpoint);
      } catch {
        throw new NonRetriableError(
          `Invalid final URL: "${endpoint}" (after template resolution)`
        );
      }

      const method = data.method;
      const options: KyOptions = { method };

      // ---------- BODY HANDLING ----------
      if (["POST", "PUT", "PATCH"].includes(method) && data.body) {
        const resolvedBody = interpolate(data.body);

        try {
          JSON.parse(resolvedBody);
        } catch {
          throw new NonRetriableError(
            `Request body is not valid JSON:\n${resolvedBody}`
          );
        }

        options.body = resolvedBody;
        options.headers = { "Content-Type": "application/json" };
      }

      // ---------- EXECUTE HTTP REQUEST ----------
      const response = await ky(endpoint, options);

      const contentType = response.headers.get("content-type");
      const responseData = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      const responsePayload = {
        httpResponse: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        },
      };

      const variableName = data.variableName;

      return {
        ...context,
        [data.variableName]: responsePayload,
      };
    });

    await send("success");
    return result;
  } catch (err) {
    await send("error");
    throw err;
  }
};
