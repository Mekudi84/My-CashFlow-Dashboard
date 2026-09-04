import { create } from "zustand";
import type { PublicUser, CurrencyCode } from "@/types";
import { api, setAccessToken, setRefreshHandler, ApiClientError } from "@/lib/api-client";

interface AuthState {
  user: PublicUser | null;
  status: "unknown" | "loading" | "authenticated" | "unauthenticated";
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    name: string;
    password: string;
    preferredCurrency: PublicUser["preferredCurrency"];
  }) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthResponse {
  user: PublicUser;
  accessToken: string;
}

export const useAuthStore = create<AuthState>((set, get) => {
  setRefreshHandler(async () => {
    try {
      const data = await api.post<AuthResponse>("/auth/refresh");
      setAccessToken(data.accessToken);
      set({ user: data.user, status: "authenticated" });
      return true;
    } catch {
      setAccessToken(null);
      set({ user: null, status: "unauthenticated" });
      return false;
    }
  });

  return {
    user: null,
    status: "unknown",
    error: null,
    bootstrap: async () => {
      set({ status: "loading" });
      try {
        const data = await api.post<AuthResponse>("/auth/refresh");
        setAccessToken(data.accessToken);
        set({ user: data.user, status: "authenticated", error: null });
      } catch {
        setAccessToken(null);
        set({ status: "unauthenticated" });
      }
    },
    login: async (email, password) => {
      set({ error: null });
      try {
        const data = await api.post<AuthResponse>("/auth/login", { email, password });
        setAccessToken(data.accessToken);
        set({ user: data.user, status: "authenticated", error: null });
      } catch (err) {
        const msg = err instanceof ApiClientError ? err.message : "Login failed";
        set({ error: msg });
        throw err;
      }
    },
    register: async (input) => {
      set({ error: null });
      try {
        const data = await api.post<AuthResponse>("/auth/register", {
          email: input.email,
          name: input.name,
          password: input.password,
          preferredCurrency: input.preferredCurrency satisfies CurrencyCode,
        });
        setAccessToken(data.accessToken);
        set({ user: data.user, status: "authenticated", error: null });
      } catch (err) {
        const msg = err instanceof ApiClientError ? err.message : "Registration failed";
        set({ error: msg });
        throw err;
      }
    },
    logout: async () => {
      try {
        await api.post("/auth/logout");
      } finally {
        setAccessToken(null);
        set({ user: null, status: "unauthenticated", error: null });
      }
    },
    _get: get,
  } satisfies AuthState & { _get: typeof get };
});