import { formatMoney } from "../utils/currency";

export default function InsightsPanel({ insights, budgetCount, currency }) {
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
              ? `${topCategory[0]} — ${formatMoney(topCategory[1], currency)}`
              : "No expenses yet"}
          </strong>
        </div>
        <div className="insight">
          <span>Average expense</span>
          <strong>
            {expenseCount > 0 ? formatMoney(average, currency) : formatMoney(0, currency)}
          </strong>
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
