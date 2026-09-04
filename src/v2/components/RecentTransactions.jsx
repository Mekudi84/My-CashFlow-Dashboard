import { formatMoney, formatDate } from "../utils/format";

const TYPE_LABELS = { income: "Income", expense: "Expense" };

export default function RecentTransactions({ transactions, onSelect, loading, count = 8 }) {
  const list = transactions.slice(0, count);
  if (loading) {
    return (
      <section className="ft-card ft-transactions" aria-label="Recent transactions">
        <header className="ft-card-head">
          <div>
            <p className="ft-eyebrow">ACTIVITY</p>
            <h2>Recent Transactions</h2>
          </div>
        </header>
        <ul className="ft-tx-list">
          {Array.from({ length: 4 }).map((_, i) => (
            <li className="ft-skel skel-tx" key={i} />
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="ft-card ft-transactions" aria-label="Recent transactions">
      <header className="ft-card-head">
        <div>
          <p className="ft-eyebrow">ACTIVITY</p>
          <h2>Recent Transactions</h2>
        </div>
        <span className="ft-pill">{list.length} items</span>
      </header>

      {list.length === 0 ? (
        <div className="ft-empty">
          <p>No transactions match your filters.</p>
        </div>
      ) : (
        <ul className="ft-tx-list">
          {list.map((t, i) => (
            <li
              key={t.id}
              className={`ft-tx-row type-${t.type} status-${t.status}`}
              style={{ "--row-index": i }}
              onClick={() => onSelect?.(t)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect?.(t);
                }
              }}
            >
              <div className="ft-tx-icon" aria-hidden="true">
                {t.type === "income" ? "↗" : "↘"}
              </div>
              <div className="ft-tx-main">
                <div className="ft-tx-name">{t.name}</div>
                <div className="ft-tx-meta">
                  <span className="ft-tx-category">{t.category}</span>
                  <span className="ft-tx-dot" aria-hidden="true" />
                  <span>{formatDate(t.date)}</span>
                </div>
              </div>
              <div className="ft-tx-type">
                <span className={`ft-badge type-${t.type}`}>{TYPE_LABELS[t.type]}</span>
              </div>
              <div className={`ft-tx-amount ${t.type}`}>
                {t.type === "income" ? "+" : "−"}
                {formatMoney(t.amount, { maximumFractionDigits: 0 })}
              </div>
              <div className="ft-tx-status">
                <span className={`ft-status is-${t.status}`}>
                  {t.status === "completed" ? "Completed" : "Pending"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
