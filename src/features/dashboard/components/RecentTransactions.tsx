import type { Category, Transaction } from "@/types";
import { formatMoney, formatDate } from "@/lib/format";

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  onSelect: (t: Transaction) => void;
  loading: boolean;
  count?: number;
}

const TYPE_LABELS: Record<Transaction["kind"], string> = {
  income: "Income",
  expense: "Expense",
  transfer: "Transfer",
};

export default function RecentTransactions({
  transactions,
  categories,
  onSelect,
  loading,
  count = 8,
}: RecentTransactionsProps) {
  const categoryById = new Map(categories.map((c) => [c.id, c]));
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
          {list.map((t, i) => {
            const cat = t.categoryId ? categoryById.get(t.categoryId) : null;
            return (
              <li
                key={t.id}
                className={`ft-tx-row type-${t.kind} status-${t.status}`}
                style={{ ["--row-index" as string]: i }}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(t)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(t);
                  }
                }}
              >
                <div className="ft-tx-icon" aria-hidden="true">
                  {t.kind === "income" ? "↗" : "↘"}
                </div>
                <div className="ft-tx-main">
                  <div className="ft-tx-name">{t.description || "Untitled"}</div>
                  <div className="ft-tx-meta">
                    <span className="ft-tx-category">{cat?.name ?? "Uncategorized"}</span>
                    <span className="ft-tx-dot" aria-hidden="true" />
                    <span>{formatDate(t.occurredOn)}</span>
                  </div>
                </div>
                <div className="ft-tx-type">
                  <span className={`ft-badge type-${t.kind}`}>{TYPE_LABELS[t.kind]}</span>
                </div>
                <div className={`ft-tx-amount ${t.kind}`}>
                  {t.kind === "income" ? "+" : "−"}
                  {formatMoney(t.amountCents, { maximumFractionDigits: 0 })}
                </div>
                <div className="ft-tx-status">
                  <span className={`ft-status is-${t.status}`}>
                    {t.status === "completed" ? "Completed" : "Pending"}
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