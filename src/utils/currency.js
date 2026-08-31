export const CURRENCIES = {
  NGN: { code: "NGN", symbol: "₦", locale: "en-NG" },
  USD: { code: "USD", symbol: "$", locale: "en-US" },
  GBP: { code: "GBP", symbol: "£", locale: "en-GB" },
  EUR: { code: "EUR", symbol: "€", locale: "en-EU" },
};

export const DEFAULT_CURRENCY = "NGN";

export function formatMoney(amount, currency = DEFAULT_CURRENCY) {
  const config = CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY];
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
  }).format(Number(amount) || 0);
}

export function getCurrencySymbol(currency = DEFAULT_CURRENCY) {
  return CURRENCIES[currency]?.symbol || CURRENCIES[DEFAULT_CURRENCY].symbol;
}
