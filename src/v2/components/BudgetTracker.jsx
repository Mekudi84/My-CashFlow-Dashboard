import { formatMoney } from "../utils/format";

export default function BudgetTracker({ budgets, loading }) {
  return (
    <section className="ft-card ft-budgets" aria-label="Monthly budgets">
      <header className="ft-card-head">
        <div>
          <p className="ft-eyebrow">BUDGETS</p>
          <h2>Monthly Budgets</h2>
        </div>
        <span className="ft-pill">{budgets.length} active</span>
      </header>

      {loading ? (
        <div className="ft-budget-list">
          {[0, 1, 2].map((i) => (
            <div className="ft-skel skel-budget" key={i} />
          ))}
        </div>
      ) : (
        <ul className="ft-budget-list">
          {budgets.map((b, i) => {
            const pct = Math.min(100, (b.spent / b.limit) * 100);
            const over = b.spent > b.limit;
            const near = !over && pct >= 80;
            const remaining = b.limit - b.spent;
            return (
              <li
                key={b.id}
                className={`ft-budget-row ${over ? "is-over" : near ? "is-near" : ""}`}
                style={{ "--row-index": i }}
              >
                <div className="ft-budget-head">
                  <div className="ft-budget-name">{b.category}</div>
                  <div className="ft-budget-amounts">
                    <strong>{formatMoney(b.spent, { maximumFractionDigits: 0 })}</strong>
                    <span> / {formatMoney(b.limit, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
                <div className="ft-progress">
                  <div
                    className="ft-progress-fill"
                    style={{ width: `${pct}%`, transitionDelay: `${i * 70}ms` }}
                  />
                </div>
                <div className="ft-budget-meta">
                  <span className={`ft-budget-status ${over ? "is-over" : near ? "is-near" : ""}`}>
                    {over
                      ? `${Math.round(pct - 100)}% over budget`
                      : near
                        ? "Approaching limit"
                        : "On track"}
                  </span>
                  <span>
                    {over
                      ? `${formatMoney(Math.abs(remaining), { maximumFractionDigits: 0 })} over`
                      : `${formatMoney(remaining, { maximumFractionDigits: 0 })} left`}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
