import crypto from "crypto";

const IV_LENGTH = 16; // AES-CBC IV (legacy keys)
const GCM_IV_LENGTH = 12;
const GCM_PREFIX = "cf_sk2_";
const LEGACY_PREFIX = "cf_sk_";

type KeyPayload = {
  userId: string;
  workflowId: string;
  triggerNodeId?: string;
};

/**
 * Derives the 32-byte AES-256 encryption key from the environment variable.
 *
 * Called lazily inside each exported function rather than at module scope so
 * that Next.js can import this module at build time (for static-page collection)
 * without requiring the env var to be present in the build environment.
 * The error is only thrown when the function is actually invoked at request time.
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.API_SECRET_KEY;
  if (!secret) {
    throw new Error(
      "API_SECRET_KEY environment variable is not set. " +
        "Set it to a strong random string in your Vercel / hosting environment variables.",
    );
  }
  return crypto.createHash("sha256").update(secret).digest();
}

/** Issues an authenticated (AES-256-GCM) key so tampering is detected. */
export function generateAPIKey(payload: KeyPayload): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(GCM_IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload)),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${GCM_PREFIX}${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts a key. Legacy unauthenticated CBC keys are still accepted so
 * existing integrations keep working, but callers MUST verify the resulting
 * ids against the database (see /api/trigger).
 */
export function decryptAPIKey(apiKey: string): KeyPayload {
  try {
    const key = getEncryptionKey();

    if (apiKey.startsWith(GCM_PREFIX)) {
      const parts = apiKey.slice(GCM_PREFIX.length).split(":");
      if (parts.length !== 3) throw new Error("Invalid key format");
      const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        key,
        Buffer.from(parts[0], "hex"),
      );
      decipher.setAuthTag(Buffer.from(parts[1], "hex"));
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(parts[2], "hex")),
        decipher.final(),
      ]);
      return JSON.parse(decrypted.toString());
    }

    if (!apiKey.startsWith(LEGACY_PREFIX))
      throw new Error("Invalid key format");
    const textParts = apiKey.slice(LEGACY_PREFIX.length).split(":");
    if (textParts.length !== 2) throw new Error("Invalid key format");

    const iv = Buffer.from(textParts[0], "hex");
    if (iv.length !== IV_LENGTH) throw new Error("Invalid key format");
    const encryptedText = Buffer.from(textParts[1], "hex");

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString());
  } catch {
    throw new Error("Invalid or tampered API Key");
  }
}
