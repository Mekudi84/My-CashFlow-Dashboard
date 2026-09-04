export interface User {
  id: string;
  email: string;
  name: string;
  preferredCurrency: import("./currency").CurrencyCode;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  accessTokenExpiresAt: string;
}