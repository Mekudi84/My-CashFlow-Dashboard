import { formatMoney } from "../utils/currency";

export default function BudgetItem({ budget, onDelete, currency }) {
  const remaining = budget.limit - budget.spent;

  return (
    <div className="budget-item">
      <div className="budget-top">
        <strong>{budget.category}</strong>
        <span>
          {formatMoney(budget.spent, currency)} / {formatMoney(budget.limit, currency)}
        </span>
      </div>
      <div className="progress">
        <div className={`progress-bar ${budget.status}`} style={{ width: `${budget.width}%` }} />
      </div>
      <div className="budget-meta">
        <span>{budget.percent.toFixed(0)}% used</span>
        <span>
          {remaining >= 0
            ? `${formatMoney(remaining, currency)} left`
            : `${formatMoney(Math.abs(remaining), currency)} over`}
        </span>
        <button className="delete-budget" type="button" onClick={() => onDelete(budget.id)}>
          Remove
        </button>
      </div>
    </div>
  );
}
