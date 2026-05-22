import crypto from 'crypto';

const IV_LENGTH = 16; // AES block size is always 16

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
      'API_SECRET_KEY environment variable is not set. ' +
      'Set it to a strong random string in your Vercel / hosting environment variables.'
    );
  }
  return crypto.createHash('sha256').update(secret).digest();
}

export function generateAPIKey(payload: KeyPayload): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  let encrypted = cipher.update(JSON.stringify(payload));
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return `cf_sk_${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptAPIKey(apiKey: string): KeyPayload {
  try {
    const key = getEncryptionKey();
    const rawKey = apiKey.replace('cf_sk_', '');
    const textParts = rawKey.split(':');
    if (textParts.length !== 2) throw new Error('Invalid key format');

    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return JSON.parse(decrypted.toString());
  } catch {
    throw new Error('Invalid or tampered API Key');
  }
}
