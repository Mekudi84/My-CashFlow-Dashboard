import type { VercelRequest, VercelResponse } from "@vercel/node";
import postgres from "postgres";

export default async function handler(_req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader("cache-control", "no-store");
  const url = process.env["DATABASE_URL"];
  if (!url) {
    res.status(503).json({
      status: "not_ready",
      reason: "DATABASE_URL is not configured",
    });
    return;
  }
  const sql = postgres(url, { max: 1, connect_timeout: 5, prepare: false });
  try {
    await sql`select 1 as ok`;
    res.status(200).json({ status: "ready" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(503).json({ status: "not_ready", reason: message });
  } finally {
    await sql.end({ timeout: 1 });
  }
}