const formatMoney = (amount) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);

export default function InsightsPanel({ insights, budgetCount }) {
  const { topCategory, average, expenseCount } = insights;

  return (
    <section className="panel insights">
      <div>
        <p className="eyebrow">INSIGHTS</p>
        <h2>Spending Overview</h2>
      </div>
      <div className="insight-grid">
        <div className="insight">
          <span>Top spending category</span>
          <strong>
            {topCategory
              ? `${topCategory[0]} — ${formatMoney(topCategory[1])}`
              : "No expenses yet"}
          </strong>
        </div>
        <div className="insight">
          <span>Average expense</span>
          <strong>{expenseCount > 0 ? formatMoney(average) : "₦0.00"}</strong>
        </div>
        <div className="insight">
          <span>Budget categories</span>
          <strong>
            {budgetCount} active budget{budgetCount === 1 ? "" : "s"}
          </strong>
        </div>
      </div>
    </section>
  );
}
