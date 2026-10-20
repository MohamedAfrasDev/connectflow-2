import crypto from "crypto";

function getSecret(): string {
  const secret = process.env.API_SECRET_KEY;
  if (!secret) {
    throw new Error("API_SECRET_KEY environment variable is not set.");
  }
  return secret;
}

/** Deterministic per-workflow webhook token (HMAC-SHA256, hex). */
export function createWebhookToken(workflowId: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(`webhook:${workflowId}`)
    .digest("hex");
}

export function verifyWebhookToken(
  workflowId: string,
  token: string | null,
): boolean {
  if (!token) return false;
  const expected = Buffer.from(createWebhookToken(workflowId));
  const given = Buffer.from(token);
  return (
    expected.length === given.length && crypto.timingSafeEqual(expected, given)
  );
}
