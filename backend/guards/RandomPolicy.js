// Autorise le hasard UNIQUEMENT pour id/token/nonce/salt.
// Interdit pour score/weight/priority/risk/metric/etc.
import { randomBytes } from "crypto";

const ALLOWED = new Set(["id", "token", "nonce", "salt"]);

export function safeRandomBytes(len, purpose) {
  if (!ALLOWED.has(purpose)) {
    throw new Error(`random_usage_forbidden:${purpose}`);
  }
  return randomBytes(len);
}