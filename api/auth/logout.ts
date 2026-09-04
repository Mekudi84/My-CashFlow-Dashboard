import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clearRefreshCookie, readRefreshCookie } from "./_lib/cookies";
import { revokeRefreshToken } from "./_lib/repository";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "Use POST" } });
    return;
  }
  const token = readRefreshCookie({ headers: req.headers });
  if (token) await revokeRefreshToken(token);
  clearRefreshCookie(res);
  res.status(204).end();
}