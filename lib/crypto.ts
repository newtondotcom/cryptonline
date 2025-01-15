import crypto from "crypto";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // AES-256 requires a 32-byte key
const IV_LENGTH = 12; // Recommended length for GCM IV
const SALT_LENGTH = 16; // Recommended salt length

// Generate a key from the password and salt
function generateKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, "sha256");
}

// Encrypt the mnemonic
export function encryptData(mnemonic: string, password: string) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = generateKey(password, salt);

  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(mnemonic, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    ciphertext: ciphertext.toString("hex"),
    tag: tag.toString("hex"),
  };
}

// Decrypt the mnemonic
export function decryptData(
  encryptedData: {
    salt: string;
    iv: string;
    ciphertext: string;
    tag: string;
  },
  password: string,
): string {
  const salt = Buffer.from(encryptedData.salt, "hex");
  const iv = Buffer.from(encryptedData.iv, "hex");
  const ciphertext = Buffer.from(encryptedData.ciphertext, "hex");
  const tag = Buffer.from(encryptedData.tag, "hex");

  const key = generateKey(password, salt);
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
