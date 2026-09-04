import type { Budget, Category, Transaction } from "@/types";
import { formatMoney } from "@/lib/format";
import { budgetStatus } from "../utils/analytics";

interface BudgetRow {
  id: string;
  categoryName: string;
  color: string;
  limitCents: number;
  spentCents: number;
}

interface BudgetTrackerProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  loading: boolean;
}

export default function BudgetTracker({ budgets, categories, transactions, loading }: BudgetTrackerProps) {
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const rows: BudgetRow[] = budgets.map((b) => {
    const cat = categoryById.get(b.categoryId);
    const spentCents = transactions
      .filter((t) => t.categoryId === b.categoryId && t.status === "completed" && t.kind === "expense")
      .reduce((s, t) => s + t.amountCents, 0);
    return {
      id: b.id,
      categoryName: cat?.name ?? "Unknown",
      color: cat?.color ?? "#64748b",
      limitCents: b.limitCents,
      spentCents,
    };
  });

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
          {rows.map((b, i) => {
            const pct = Math.min(100, (b.spentCents / Math.max(1, b.limitCents)) * 100);
            const status = budgetStatus(pct);
            const over = status === "over";
            const near = status === "near";
            const remaining = b.limitCents - b.spentCents;
            return (
              <li
                key={b.id}
                className={`ft-budget-row ${over ? "is-over" : near ? "is-near" : ""}`}
                style={{ ["--row-index" as string]: i }}
              >
                <div className="ft-budget-head">
                  <div className="ft-budget-name">{b.categoryName}</div>
                  <div className="ft-budget-amounts">
                    <strong>{formatMoney(b.spentCents, { maximumFractionDigits: 0 })}</strong>
                    <span> / {formatMoney(b.limitCents, { maximumFractionDigits: 0 })}</span>
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