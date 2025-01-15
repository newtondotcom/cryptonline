import { defineEventHandler, readBody } from "h3";
import { decryptData } from "~/lib/crypto";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.encryptedData || !body.password) {
    throw new Error("Encrypted data and password are required.");
  }

  try {
    const decryptedMnemonic = decryptData(body.encryptedData, body.password);
    return { decryptedMnemonic };
  } catch (error) {
    throw new Error(
      "Decryption failed. Ensure the password and data are correct.",
    );
  }
});
