import { CURRENCIES, DEFAULT_CURRENCY } from "../utils/currency";
import { useLocalStorage } from "../hooks/useLocalStorage";

export default function CurrencySelector({ currency, onChange }) {
  return (
    <div className="currency-selector">
      <label htmlFor="currency-select">Currency</label>
      <div className="currency-select-wrap">
        <select
          id="currency-select"
          value={currency}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Select currency"
        >
          {Object.entries(CURRENCIES).map(([key, config]) => (
            <option key={key} value={key}>
              {key} {config.symbol}
            </option>
          ))}
        </select>
        <span className="currency-arrow" aria-hidden="true">
          ▼
        </span>
      </div>
    </div>
  );
}
