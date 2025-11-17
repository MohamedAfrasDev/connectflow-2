// src/features/credentials/constant.ts
export enum CredentialTypeClient {
    OPENAI = "OPENAI",
    GEMINI = "GEMINI",
    ANTHROPIC = "ANTHROPIC",
    DEEPSEEK = "DEEPSEEK",
    PERPLEXITY = "PERPLEXITY",
    GMAIL = "GMAIL",
    CustomMail = "CustomMail",

  }
  
  export const credentialLogos: Record<CredentialTypeClient, string> = {
    OPENAI: "/logos/openai.svg",
    GEMINI: "/logos/gemini.svg",
    ANTHROPIC: "/logos/anthropic.svg",
    DEEPSEEK: "/logos/deepseek.svg",
    PERPLEXITY: "/logos/perplexity.svg",
    GMAIL: "/logos/gmail.svg",
    CustomMail: "/logos/email.svg"

  };
  