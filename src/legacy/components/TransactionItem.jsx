import { useRef, useEffect } from "react";
import { escapeHtml } from "../utils/escape";
import { formatMoney } from "../utils/currency";

export default function TransactionItem({ transaction, onEdit, onDelete, currency }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [transaction.id]);

  const sign = transaction.type === "income" ? "+" : "-";
  const initial = (transaction.description || transaction.category || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <article className="transaction" ref={ref}>
      <div className="transaction-main">
        <div className={`tx-icon ${transaction.type}`} aria-hidden="true">
          {transaction.type === "income" ? "↗" : "↘"}
        </div>
        <div className="transaction-text">
          <div className="transaction-title">{escapeHtml(transaction.description)}</div>
          <div className="transaction-meta">
            {escapeHtml(transaction.category)} · {formatDate(transaction.date)}
          </div>
        </div>
      </div>
      <div className={`transaction-amount ${transaction.type}`}>
        {sign}
        {formatMoney(Number(transaction.amount), currency)}
      </div>
      <div className="actions">
        <button className="action-btn" type="button" onClick={() => onEdit(transaction.id)}>
          Edit
        </button>
        <button
          className="action-btn delete"
          type="button"
          onClick={() => onDelete(transaction.id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}
