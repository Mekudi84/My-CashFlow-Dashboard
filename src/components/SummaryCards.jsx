import { formatMoney } from "../utils/currency";

export default function SummaryCards({ summary, currency }) {
  const { balance, income, expenses, savingsRate } = summary;

  return (
    <section className="summary-grid" aria-label="Financial summary">
      <article className="summary-card balance">
        <span>Current Balance</span>
        <div className="card-icon" aria-hidden="true">◈</div>
        <strong>{formatMoney(balance, currency)}</strong>
        <small>Income minus expenses</small>
      </article>
      <article className="summary-card income">
        <span>Total Income</span>
        <div className="card-icon" aria-hidden="true">↗</div>
        <strong>{formatMoney(income, currency)}</strong>
        <small>All recorded income</small>
      </article>
      <article className="summary-card expense">
        <span>Total Expenses</span>
        <div className="card-icon" aria-hidden="true">↘</div>
        <strong>{formatMoney(expenses, currency)}</strong>
        <small>All recorded spending</small>
      </article>
      <article className="summary-card savings">
        <span>Savings Rate</span>
        <div className="card-icon" aria-hidden="true">◉</div>
        <strong>{Math.max(savingsRate, 0).toFixed(1)}%</strong>
        <small>{income ? `${formatMoney(Math.max(balance, 0), currency)} currently saved` : "No income recorded yet"}</small>
      </article>
    </section>
  );
}
