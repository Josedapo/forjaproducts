import crypto from "crypto";

export const AUTH_COOKIE_NAME = "forja_auth";

const TOKEN_PREFIX = "forja_v1";

export function verifyPassword(password: string): boolean {
  const expected = process.env.AUTH_PASSWORD;
  if (!expected) return false;
  return password === expected;
}

export function createAuthToken(): string {
  const secret = process.env.AUTH_PASSWORD ?? "";
  const payload = `${TOKEN_PREFIX}:${Date.now()}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

export function verifyAuthToken(token: string): boolean {
  const secret = process.env.AUTH_PASSWORD;
  if (!secret || !token) return false;

  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return false;

  const payload = token.substring(0, dotIndex);
  const signature = token.substring(dotIndex + 1);

  if (!payload.startsWith(TOKEN_PREFIX)) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex")
  );
}
