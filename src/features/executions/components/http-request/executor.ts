import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

import Handlebars from "handlebars";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
   const safeString = new Handlebars.SafeString(jsonString);


   return safeString;
});

type HttpRequestData = {
    variableName: string;
    endpoint: string; 
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
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

    if (!data.variableName) {
        throw new NonRetriableError("Variable name configured");
    }
    if (!data.method) {
        throw new NonRetriableError("Method configured");
    }

    const result = await step.run("http-request", async () => {
        const endpoint = Handlebars.compile(data.endpoint)(context);
        const method = data.method;

        const options: KyOptions = { method };

        if (["POST", "PUT", "PATCH"].includes(method) && data.body) {
            const resolved = Handlebars.compile(data.body || "{}")(context);
            JSON.parse(resolved);
            options.body = resolved;
            options.headers = {
                "Content-Type": "application/json"
            };
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
        return {
            ...context,
           [data.variableName]: responsePayload,
        };
       

       
    });

    // result is already a WorkflowContext
    return result;
};
