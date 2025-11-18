import crypto from 'crypto';

// 1. Get your raw secret from env (can be any length string now)
const RAW_SECRET = process.env.API_SECRET_KEY || 'my-fallback-secret-key'; 

// 2. ⚠️ FIX: Hash the key to ensure it is EXACTLY 32 bytes (256 bits)
// This prevents the "Invalid key length" crash forever.
const ENCRYPTION_KEY = crypto.createHash('sha256').update(String(RAW_SECRET)).digest();

const IV_LENGTH = 16; // AES block size is always 16

type KeyPayload = {
  userId: string;
  workflowId: string;
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