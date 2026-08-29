import { useRef, useEffect } from "react";
import { escapeHtml } from "../utils/escape";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-NG", { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(`${date}T00:00:00`));

export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [transaction.id]);

  const sign = transaction.type === "income" ? "+" : "-";

  return (
    <article className="transaction" ref={ref}>
      <div className="transaction-main">
        <div className="transaction-title">{escapeHtml(transaction.description)}</div>
        <div className="transaction-meta">
          {escapeHtml(transaction.category)} · {formatDate(transaction.date)}
        </div>
      </div>
      <div className={`transaction-amount ${transaction.type}`}>
        {sign}{formatMoney(Number(transaction.amount))}
      </div>
      <div className="actions">
        <button className="action-btn" type="button" onClick={() => onEdit(transaction.id)}>Edit</button>
        <button className="action-btn delete" type="button" onClick={() => onDelete(transaction.id)}>Delete</button>
      </div>
    </article>
  );
}
