const formatMoney = (amount) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);

export default function SummaryCards({ summary }) {
  const { balance, income, expenses, savingsRate } = summary;

  return (
    <section className="summary-grid" aria-label="Financial summary">
      <article className="summary-card balance">
        <span>Current Balance</span>
        <strong>{formatMoney(balance)}</strong>
        <small>Income minus expenses</small>
      </article>
      <article className="summary-card income">
        <span>Total Income</span>
        <strong>{formatMoney(income)}</strong>
        <small>All recorded income</small>
      </article>
      <article className="summary-card expense">
        <span>Total Expenses</span>
        <strong>{formatMoney(expenses)}</strong>
        <small>All recorded spending</small>
      </article>
      <article className="summary-card savings">
        <span>Savings Rate</span>
        <strong>{Math.max(savingsRate, 0).toFixed(1)}%</strong>
        <small>{income ? `${formatMoney(Math.max(balance, 0))} currently saved` : "No income recorded yet"}</small>
      </article>
    </section>
  );
}
