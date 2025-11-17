import type { NodeExecutor } from "@/features/executions/types";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import nodemailer, { SentMessageInfo } from "nodemailer";
import { customMailChannel } from "@/inngest/channels/custom_mail";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

export type CustomMailData = {
  variableName?: string;
  credentialId?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  body?: string;
};


export const customMailExecutor: NodeExecutor<CustomMailData> = async ({
  data,
  context,
  nodeId,
  userId,
  step,
  publish,
}) => {
  await publish(customMailChannel().status({ nodeId, status: "loading" }));

  if (!data.variableName) {
    await publish(customMailChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Custom Mail node: Variable name is missing");
  }
  if (!data.credentialId) {
    await publish(customMailChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Custom Mail node: Credential is missing");
  }
  if (!data.to) {
    await publish(customMailChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Custom Mail node: 'To' field is missing");
  }
  if (!data.subject) {
    await publish(customMailChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Custom Mail node: Subject is missing");
  }
  if (!data.body) {
    await publish(customMailChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Custom Mail node: Body is missing");
  }

  // Fetch credential
  const credential = await step.run("get-credential", async () => {
    return prisma.credential.findUnique({
      where: { id: data.credentialId, userId },
      select: {
        // --- UPDATED ---
        // Select the correct fields for CustomMail auth
        smtpHost: true,
        smtpPort: true,
        smtpUser: true,
        smtpPassword: true,
        secure: true,
      },
    });
  }) as {
    // --- UPDATED ---
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    secure: boolean;
  } | null;


  // --- UPDATED ---
  // Check for the correct auth fields
  if (!credential || !credential.smtpUser || !credential.smtpPassword || !credential.smtpHost) {
    // --- ADDED ---
    // Publish the error status before throwing
    await publish(customMailChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Custom Mail node: Credential not found or invalid (Missing host, user, or password)");
  }

  const compiledTo = Handlebars.compile(data.to)(context);
  const compiledSubject = Handlebars.compile(data.subject)(context);
  const compiledBody = Handlebars.compile(data.body)(context);

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: credential.smtpHost,
    port: Number(credential.smtpPort),
    secure: credential.secure,
    auth: {
      // --- UPDATED ---
      // Use the correct fields for auth
      user: credential.smtpUser,
      pass: credential.smtpPassword,
      
    },
  });


  let info: SentMessageInfo;
  try {
  // ... inside the try block ...

info = await step.run("Custom Mail-send", async () => {
  return transporter.sendMail({
    // --- ADDED: Explicitly set the 'from' address ---
    from: credential.smtpUser, 
    // --------------------------------------------------
    to: compiledTo,
    cc: data.cc ? Handlebars.compile(data.cc)(context) : undefined,
    bcc: data.bcc ? Handlebars.compile(data.bcc)(context) : undefined,
    subject: compiledSubject,
    html: compiledBody,
  });
});
console.log("Mail sent successfully, server response:", info);
    await publish(customMailChannel().status({ nodeId, status: "success" }));

    return {
      ...context,
      [data.variableName]: {
        success: true,
        messageId: info.messageId,
        to: compiledTo,
      },
    };
  } catch (error: any) {
    await publish(customMailChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError(error.message || "Custom Mail send failed");
  }
};