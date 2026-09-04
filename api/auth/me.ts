import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "./_lib/middleware";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "Use GET" } });
    return;
  }
  const user = await requireAuth(req);
  res.status(200).json({ user });
}