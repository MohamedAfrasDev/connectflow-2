import type { NodeExecutor } from "@/features/executions/types";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { gmailChannel } from "@/inngest/channels/gmail";
import prisma from "@/lib/db";
import nodemailer, { SentMessageInfo } from "nodemailer";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

export type GmailData = {
  variableName?: string;
  credentialId?: string;
  to?: string;
  subject?: string;
  body?: string;
};

export const gmailExecutor: NodeExecutor<GmailData> = async ({
  data,
  context,
  nodeId,
  userId,
  step,
  publish,
}) => {
  await publish(gmailChannel().status({ nodeId, status: "loading" }));

  if (!data.variableName) {
    await publish(gmailChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Gmail node: Variable name is missing");
  }
  if (!data.credentialId) {
    await publish(gmailChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Gmail node: Credential is missing");
  }
  if (!data.to) {
    await publish(gmailChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Gmail node: 'To' field is missing");
  }
  if (!data.subject) {
    await publish(gmailChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Gmail node: Subject is missing");
  }
  if (!data.body) {
    await publish(gmailChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Gmail node: Body is missing");
  }

  // Fetch credential
  const credential = await step.run("get-credential", async () => {
    return prisma.credential.findUnique({
      where: { id: data.credentialId, userId },
    });
  });

  if (!credential || !credential.email || !credential.appPassword) {
    throw new NonRetriableError("Gmail node: Credential not found or invalid");
  }

  const compiledTo = Handlebars.compile(data.to)(context);
  const compiledSubject = Handlebars.compile(data.subject)(context);
  const compiledBody = Handlebars.compile(data.body)(context);

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: credential.email,
      pass: credential.appPassword,
    },
  });

  let info: SentMessageInfo;
  try {
    info = await step.run("gmail-send", async () => {
      return transporter.sendMail({
        to: compiledTo,
        subject: compiledSubject,
        html: compiledBody,
      });
    });

    await publish(gmailChannel().status({ nodeId, status: "success" }));

    return {
      ...context,
      [data.variableName]: {
        success: true,
        messageId: info.messageId, // ✅ properly defined
        to: compiledTo,
      },
    };
  } catch (error: any) {
    await publish(gmailChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError(error.message || "Gmail send failed");
  }
};
