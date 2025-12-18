import Crypto from "crypto";

export function hashToken(token) {
  // SHA-256 is fast and secure for this purpose
  // We don't need bcrypt because:
  // 1. Tokens are random (no brute force risk)
  // 2. Tokens are single-use and expire
  // 3. Speed matters for user experience
  return Crypto.createHash("sha256").update(token).digest("hex");
}
