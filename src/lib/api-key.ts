import crypto from 'crypto';

// Hash the secret to always produce a 32-byte AES-256 key.
// Throws on startup if the env variable is not configured so misconfiguration
// is caught immediately rather than silently using a known fallback value.
function buildEncryptionKey(): Buffer {
  const secret = process.env.API_SECRET_KEY;
  if (!secret) {
    throw new Error(
      'API_SECRET_KEY environment variable is not set. ' +
      'Set it to a strong random string before starting the server.'
    );
  }
  return crypto.createHash('sha256').update(secret).digest();
}

const ENCRYPTION_KEY = buildEncryptionKey();

const IV_LENGTH = 16; // AES block size is always 16

type KeyPayload = {
  userId: string;
  workflowId: string;
  triggerNodeId?: string;
};

export function generateAPIKey(payload: KeyPayload): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  // Now ENCRYPTION_KEY is guaranteed to be the correct length
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(JSON.stringify(payload));
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return `cf_sk_${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptAPIKey(apiKey: string): KeyPayload {
  try {
    const rawKey = apiKey.replace('cf_sk_', '');
    const textParts = rawKey.split(':');
    if (textParts.length !== 2) throw new Error("Invalid key format");

    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return JSON.parse(decrypted.toString());
  } catch (error) {
    throw new Error("Invalid or tampered API Key");
  }
}