export type CurrencyCode = "USD" | "NGN" | "GBP" | "EUR";

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  label: string;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: { code: "USD", symbol: "$", label: "US Dollar", locale: "en-US" },
  NGN: { code: "NGN", symbol: "₦", label: "Nigerian Naira", locale: "en-NG" },
  GBP: { code: "GBP", symbol: "£", label: "British Pound", locale: "en-GB" },
  EUR: { code: "EUR", symbol: "€", label: "Euro", locale: "de-DE" },
};

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export const CURRENCY_LIST: Currency[] = Object.values(CURRENCIES);