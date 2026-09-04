import { CURRENCIES, type CurrencyCode } from "@/types";

export interface FormatMoneyOptions {
  currency?: CurrencyCode;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
  locale?: string;
}

export function formatMoney(cents: number, opts: FormatMoneyOptions = {}): string {
  const currency = opts.currency ?? "USD";
  const cfg = CURRENCIES[currency];
  const value = cents / 100;
  return new Intl.NumberFormat(opts.locale ?? cfg.locale, {
    style: "currency",
    currency,
    maximumFractionDigits: opts.maximumFractionDigits ?? 2,
    minimumFractionDigits: opts.minimumFractionDigits ?? 0,
  }).format(value);
}

export function formatNumber(value: number, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

export function formatDate(value: string | Date, locale: string = "en-US"): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateShort(value: string | Date, locale: string = "en-US"): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(date);
}