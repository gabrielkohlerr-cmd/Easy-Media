import { randomBytes } from "node:crypto";

export function gerarTokenAleatorio() {
  return randomBytes(9).toString("base64url");
}
