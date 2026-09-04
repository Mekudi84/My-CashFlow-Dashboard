export default function ExpenseBreakdown({ insights, currency }) {
  const totals = insights?.categoryTotals || {};
  const entries = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  if (entries.length === 0) {
    return (
      <section className="panel breakdown-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">ANALYTICS</p>
            <h2>Expense Breakdown</h2>
          </div>
        </div>
        <div className="chart-empty">
          <div className="empty-icon">◔</div>
          <h3>No expenses yet</h3>
          <p>Your spending by category will appear here.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel breakdown-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">ANALYTICS</p>
          <h2>Expense Breakdown</h2>
        </div>
        <span className="count-badge">{entries.length} categories</span>
      </div>

      <ul className="breakdown-list">
        {entries.map(([category, value], index) => {
          const percent = total ? (value / total) * 100 : 0;
          return (
            <li className="breakdown-row" key={category} style={{ "--row-index": index }}>
              <div className="breakdown-meta">
                <span className="breakdown-name">{category}</span>
                <span className="breakdown-value">{formatCategoryValue(value, currency)}</span>
              </div>
              <div className="breakdown-bar">
                <div className="breakdown-fill" style={{ width: `${percent}%` }} />
              </div>
              <span className="breakdown-percent">{percent.toFixed(1)}%</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function formatCategoryValue(value, currency) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "NGN",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return String(value);
  }
}
