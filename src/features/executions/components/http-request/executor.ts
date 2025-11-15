import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HttpRequestData = {
    variableName?: string;
    endpoint?: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
    data,
    context,
    step,
}) => {
    if (!data.endpoint) {
        throw new NonRetriableError("HTTP Request node: no endpoint configured");
    }

    if (!data.variableName && typeof data.variableName === "string") {
        throw new NonRetriableError("Variable name configured");
    }

    const result = await step.run("http-request", async () => {
        const endpoint = data.endpoint!;
        const method = data.method ?? "GET";

        const options: KyOptions = { method };

        if (["POST", "PUT", "PATCH"].includes(method) && data.body) {
            options.body = data.body;
        }

        // Execute request
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

        // ALWAYS return WorkflowContext object
       if(data.variableName) {
        return {
            ...context,
           [data.variableName]: responsePayload,
        };
       }

       return {
        ...context,
        ...responsePayload,
       }
    });

    // result is already a WorkflowContext
    return result;
};
