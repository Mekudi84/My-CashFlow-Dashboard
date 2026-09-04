import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse): void {
  res.setHeader("cache-control", "no-store");
  res.status(200).json({
    status: "ok",
    service: "my-cashflow-dashboard-api",
    time: new Date().toISOString(),
  });
}