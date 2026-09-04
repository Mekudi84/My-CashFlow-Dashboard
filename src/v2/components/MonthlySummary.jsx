import { formatMoney } from "../utils/format";

export default function MonthlySummary({ summary, largestCategory, loading }) {
  const { monthlyIncome, monthlyExpenses, totalSavings, totalBalance } = summary;
  const savingsRate = monthlyIncome
    ? Math.max(0, ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)
    : 0;
  const budgetRemaining = Math.max(0, totalSavings - 0);

  if (loading) {
    return (
      <section className="ft-card ft-summary" aria-label="Monthly summary">
        <header className="ft-card-head">
          <div>
            <p className="ft-eyebrow">SUMMARY</p>
            <h2>Monthly Summary</h2>
          </div>
        </header>
        <div className="ft-skel skel-summary" />
      </section>
    );
  }

  const items = [
    {
      label: "Total income",
      value: formatMoney(monthlyIncome, { maximumFractionDigits: 0 }),
      tone: "income",
    },
    {
      label: "Total expenses",
      value: formatMoney(monthlyExpenses, { maximumFractionDigits: 0 }),
      tone: "expense",
    },
    {
      label: "Money saved",
      value: formatMoney(Math.max(0, monthlyIncome - monthlyExpenses), {
        maximumFractionDigits: 0,
      }),
      tone: "savings",
    },
    { label: "Savings rate", value: `${savingsRate.toFixed(1)}%`, tone: "savings" },
    { label: "Largest category", value: largestCategory || "—", tone: "neutral" },
    {
      label: "Total balance",
      value: formatMoney(totalBalance, { maximumFractionDigits: 0 }),
      tone: "primary",
    },
  ];

  return (
    <section className="ft-card ft-summary" aria-label="Monthly summary">
      <header className="ft-card-head">
        <div>
          <p className="ft-eyebrow">SUMMARY</p>
          <h2>Monthly Summary</h2>
        </div>
      </header>
      <ul className="ft-summary-list">
        {items.map((it, i) => (
          <li
            key={it.label}
            className={`ft-summary-item tone-${it.tone}`}
            style={{ "--row-index": i }}
          >
            <span>{it.label}</span>
            <strong>{it.value}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
