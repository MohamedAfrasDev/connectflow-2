import { NodeType } from "@/generated/prisma/enums";
import { NodeExecutor } from "../types";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { stripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";
import { geminiExecutor } from "../components/gemini/executor";
import { openAIExecutor } from "../components/openai/executor";
import { anthropicExecutor } from "../components/anthropic/executor";
import { deepSeekExecutor } from "../components/deepseek/executor";
import { perplexityExecutor } from "../components/perplexity/executor";
import { discordExecutor } from "../components/discord/executor";
import { gmailExecutor } from "../components/gmail/executor";
import { apiExecutor } from "@/features/triggers/components/api-trigger/executor";
import { customMailExecutor } from "../components/custom_mail/executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
    [NodeType.MANUAL_TRIGGER]:manualTriggerExecutor,
    [NodeType.INITIAL]:manualTriggerExecutor,
    [NodeType.HTTP_REQUEST]:httpRequestExecutor, 
    [NodeType.GOOGLE_FORM_TRIGGER]:googleFormTriggerExecutor,
    [NodeType.STRIPE_TRIGGER]:stripeTriggerExecutor,
    [NodeType.GEMINI]:geminiExecutor,
    [NodeType.ANTHROPIC]:anthropicExecutor,

    [NodeType.OPENAI]:openAIExecutor,
    [NodeType.DEEPSEEK]:deepSeekExecutor,
    [NodeType.PERPLEXITY]:perplexityExecutor,

    [NodeType.DISCORD]:discordExecutor,
    [NodeType.SLACK]:discordExecutor,

    [NodeType.GMAIL]:gmailExecutor,
    [NodeType.API]:apiExecutor,
    [NodeType.CUSTOM_MAIL]:customMailExecutor,

};


export const getExecutor = (type: NodeType): NodeExecutor => {
    const executor = executorRegistry[type];
    if(!executor) {
        throw new Error(`No executor found for node type: ${type}`);
    }

    return executor;
}