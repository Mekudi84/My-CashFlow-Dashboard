import { useEffect, useState } from "react";
import Icon from "./Icon";
import { formatMoney, formatDate } from "../utils/format";
import { CATEGORIES } from "../data/mockData";

const STATUSES = ["completed", "pending"];

export default function TransactionDrawer({ transaction, open, onClose, onSave, onDelete }) {
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (transaction) setDraft({ ...transaction });
  }, [transaction]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !transaction || !draft) return null;

  const handleChange = (field, value) => setDraft((d) => ({ ...d, [field]: value }));

  const handleSave = (e) => {
    e.preventDefault();
    onSave?.(draft);
    onClose();
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this transaction?")) return;
    onDelete?.(draft.id);
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
          <button type="button" className="ft-icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </header>

        <form className="ft-drawer-form" onSubmit={handleSave}>
          <label>
            Name
            <input
              value={draft.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </label>

          <div className="ft-modal-row">
            <label>
              Amount
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={draft.amount}
                onChange={(e) => handleChange("amount", parseFloat(e.target.value) || 0)}
                required
              />
            </label>
            <label>
              Date
              <input
                type="date"
                value={draft.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
              />
            </label>
          </div>

          <div className="ft-modal-row">
            <label>
              Category
              <select
                value={draft.category}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select value={draft.status} onChange={(e) => handleChange("status", e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Type
            <div className="ft-segmented" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={draft.type === "expense"}
                className={draft.type === "expense" ? "is-active" : ""}
                onClick={() => handleChange("type", "expense")}
              >
                Expense
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={draft.type === "income"}
                className={draft.type === "income" ? "is-active" : ""}
                onClick={() => handleChange("type", "income")}
              >
                Income
              </button>
            </div>
          </label>

          <label>
            Notes
            <textarea
              rows={4}
              value={draft.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Add a short note about this transaction"
            />
          </label>

          <div className="ft-drawer-summary">
            <div>
              <span>Recorded on</span>
              <strong>{formatDate(draft.date)}</strong>
            </div>
            <div>
              <span>Amount</span>
              <strong className={draft.type === "income" ? "is-up" : "is-down"}>
                {draft.type === "income" ? "+" : "−"}
                {formatMoney(draft.amount)}
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
