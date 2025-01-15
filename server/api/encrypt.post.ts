import { defineEventHandler, readBody } from "h3";
import { encryptData } from "~/lib/crypto";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.criticalData || !body.password) {
    throw new Error("Mnemonic and password are required.");
  }

  const encryptedData = encryptData(body.criticalData, body.password);
  return { encryptedData };
});
