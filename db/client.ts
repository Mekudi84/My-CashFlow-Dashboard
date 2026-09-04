import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const url = process.env["DATABASE_URL"];

declare global {
  // eslint-disable-next-line no-var
  var __PG__: ReturnType<typeof postgres> | undefined;
}

function client() {
  if (!globalThis.__PG__) {
    if (!url) {
      // In environments without a DB (e.g. health checks, preview deploys),
      // throw a typed error the readiness endpoint can catch.
      throw new Error("DATABASE_URL is not set");
    }
    globalThis.__PG__ = postgres(url, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
  }
  return globalThis.__PG__;
}

export const db = new Proxy(
  {},
  {
    get(_target, prop) {
      const sql = client();
      const orm = drizzle(sql, { schema });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (orm as any)[prop];
    },
  },
) as ReturnType<typeof drizzle<typeof schema>>;

export { schema };