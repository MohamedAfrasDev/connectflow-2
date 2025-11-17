import { InitialNode } from "@/components/initial-node";
import { AnthropicNode } from "@/features/executions/components/anthropic/node";
import { DeepSeekNode } from "@/features/executions/components/deepseek/node";
import { DiscordNode } from "@/features/executions/components/discord/node";
import { GeminiNode } from "@/features/executions/components/gemini/node";
import { GmailNode } from "@/features/executions/components/gmail/node";
import { HttpRequestNode } from "@/features/executions/components/http-request/node";
import { OpenAINode } from "@/features/executions/components/openai/node";
import { PerlexityNode } from "@/features/executions/components/perplexity/node";
import { APITriggerNode } from "@/features/triggers/components/api-trigger/node";
import { GoogleFormTrigger } from "@/features/triggers/components/google-form-trigger/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { StripeTriggerNode } from "@/features/triggers/components/stripe-trigger/node";
import { NodeType } from "@/generated/prisma/enums";


export const nodeComponent = {
    [NodeType.INITIAL]: InitialNode,
    [NodeType.HTTP_REQUEST]: HttpRequestNode,
   [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
   [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTrigger,
   [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
   [NodeType.GEMINI]: GeminiNode,
   [NodeType.OPENAI]: OpenAINode,

   [NodeType.ANTHROPIC]: AnthropicNode,
   [NodeType.DEEPSEEK]: DeepSeekNode,

   [NodeType.PERPLEXITY]: PerlexityNode,
   [NodeType.DISCORD]: DiscordNode,
   [NodeType.GMAIL]: GmailNode,

   [NodeType.API]: APITriggerNode,


} as const;

export type RegisteredNodeType = keyof typeof nodeComponent;