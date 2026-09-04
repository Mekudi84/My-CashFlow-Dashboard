import { SignJWT, jwtVerify } from "jose";
import type { AccessTokenPayload } from "../_schemas";

const ACCESS_TTL = process.env["ACCESS_TOKEN_TTL"] ?? "15m";
const ENC = new TextEncoder();

function secret(): Uint8Array {
  const value = process.env["JWT_ACCESS_SECRET"];
  if (!value || value.length < 32) {
    throw new Error("JWT_ACCESS_SECRET is missing or too short (>= 32 chars required)");
  }
  return ENC.encode(value);
}

export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .setIssuer("my-cashflow-dashboard")
    .setAudience("my-cashflow-dashboard-web")
    .sign(secret());
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, secret(), {
    issuer: "my-cashflow-dashboard",
    audience: "my-cashflow-dashboard-web",
  });
  return {
    sub: String(payload.sub),
    email: String(payload["email"] ?? ""),
    name: String(payload["name"] ?? ""),
    preferredCurrency: (payload["preferredCurrency"] as AccessTokenPayload["preferredCurrency"]) ?? "USD",
  };
}