import type { Category, Transaction, TransactionKind, TransactionStatus } from "@/types";
import { formatMoney, formatDate } from "@/lib/format";

interface TransactionDrawerProps {
  transaction: Transaction | null;
  categories: Category[];
  open: boolean;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
}

const STATUSES: TransactionStatus[] = ["completed", "pending"];
const KINDS: TransactionKind[] = ["expense", "income"];

export default function TransactionDrawer({
  transaction,
  categories,
  open,
  onClose,
  onSave,
  onDelete,
}: TransactionDrawerProps) {
  if (!open || !transaction) return null;

  const handleDelete = () => {
    if (!window.confirm("Delete this transaction?")) return;
    onDelete(transaction.id);
    onClose();
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const patch: Partial<Transaction> = {
      description: String(data.get("description") ?? transaction.description).trim(),
      amountCents: Math.round(Number(data.get("amount") ?? transaction.amountCents / 100) * 100),
      occurredOn: String(data.get("date") ?? transaction.occurredOn),
      categoryId: String(data.get("category") ?? transaction.categoryId ?? ""),
      kind: (String(data.get("kind") ?? transaction.kind) as TransactionKind),
      status: (String(data.get("status") ?? transaction.status) as TransactionStatus),
    };
    onSave(transaction.id, patch);
    onClose();
  };

  return (
    <div
      className="ft-drawer-root"
      role="dialog"
      aria-modal="true"
      aria-label="Transaction details"
    >
      <div className="ft-drawer-overlay" onClick={onClose} />
      <aside className="ft-drawer" aria-label="Transaction details">
        <header className="ft-drawer-head">
          <div>
            <p className="ft-eyebrow">TRANSACTION</p>
            <h2>Details</h2>
          </div>
          <button
            type="button"
            className="ft-icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <form className="ft-drawer-form" onSubmit={handleSave}>
          <label>
            Description
            <input
              name="description"
              defaultValue={transaction.description}
              required
              maxLength={120}
            />
          </label>

          <div className="ft-modal-row">
            <label>
              Amount
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                defaultValue={(transaction.amountCents / 100).toFixed(2)}
                required
              />
            </label>
            <label>
              Date
              <input
                name="date"
                type="date"
                defaultValue={transaction.occurredOn}
                required
              />
            </label>
          </div>

          <div className="ft-modal-row">
            <label>
              Category
              <select name="category" defaultValue={transaction.categoryId ?? ""}>
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select name="status" defaultValue={transaction.status}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s[0]?.toUpperCase() ?? ""}
                    {s.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="ft-segmented" role="radiogroup" aria-label="Type">
            <legend className="ft-sr-only">Type</legend>
            {KINDS.map((k) => (
              <label key={k} className={`ft-segmented-option ${transaction.kind === k ? "is-active" : ""}`}>
                <input
                  type="radio"
                  name="kind"
                  value={k}
                  defaultChecked={transaction.kind === k}
                />
                {k === "expense" ? "Expense" : "Income"}
              </label>
            ))}
          </fieldset>

          <div className="ft-drawer-summary">
            <div>
              <span>Recorded on</span>
              <strong>{formatDate(transaction.occurredOn)}</strong>
            </div>
            <div>
              <span>Amount</span>
              <strong className={transaction.kind === "income" ? "is-up" : "is-down"}>
                {transaction.kind === "income" ? "+" : "−"}
                {formatMoney(transaction.amountCents)}
              </strong>
            </div>
          </div>

          <footer className="ft-modal-foot">
            <button type="button" className="ft-btn ft-btn-danger" onClick={handleDelete}>
              Delete
            </button>
            <button type="submit" className="ft-btn ft-btn-primary">
              Save changes
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}