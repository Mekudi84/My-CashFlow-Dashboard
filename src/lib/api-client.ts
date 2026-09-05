import type { CurrencyCode } from "@/types";

const BASE = (import.meta.env.VITE_API_BASE_URL ?? "/api") as string;

let accessToken: string | null = null;
let refreshHandler: (() => Promise<boolean>) | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function setRefreshHandler(handler: (() => Promise<boolean>) | null): void {
  refreshHandler = handler;
}

export class ApiClientError extends Error {
  override readonly name = "ApiClientError";
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

interface RequestOpts {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  retry?: boolean;
  query?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
  const url = new URL(`${BASE}${path}`, window.location.origin);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  return url.pathname + url.search;
}

async function send<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const { method = "GET", body, signal, retry = true, query } = opts;
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (accessToken) headers["authorization"] = `Bearer ${accessToken}`;
  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });
  if (res.status === 401 && retry && refreshHandler) {
    const refreshed = await refreshHandler();
    if (refreshed) return send<T>(path, { ...opts, retry: false });
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const json = text ? (JSON.parse(text) as { error?: { code: string; message: string } }) : {};
  if (!res.ok) {
    throw new ApiClientError(
      res.status,
      json.error?.code ?? "UNKNOWN",
      json.error?.message ?? `Request failed (${res.status})`,
    );
  }
  return json as T;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
}

export const api = {
  get: <T>(path: string, query?: Record<string, string | number | undefined>) =>
    send<T>(path, { query }),
  post: <T>(path: string, body?: unknown) => send<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => send<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => send<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => send<T>(path, { method: "DELETE" }),
};

export type { CurrencyCode };