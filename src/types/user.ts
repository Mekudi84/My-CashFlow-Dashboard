import type { CurrencyCode } from "./currency";

export interface User {
  id: string;
  email: string;
  name: string;
  preferredCurrency: CurrencyCode;
  createdAt: string;
}

export type PublicUser = User;

export interface AuthSession {
  user: User;
  accessTokenExpiresAt: string;
}