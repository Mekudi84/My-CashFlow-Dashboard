const formatMoney = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export default function BudgetItem({ budget, onDelete }) {
  const remaining = budget.limit - budget.spent;

  return (
    <div className="budget-item">
      <div className="budget-top">
        <strong>{budget.category}</strong>
        <span>
          {formatMoney(budget.spent)} / {formatMoney(budget.limit)}
        </span>
      </div>
      <div className="progress">
        <div className={`progress-bar ${budget.status}`} style={{ width: `${budget.width}%` }} />
      </div>
      <div className="budget-meta">
        <span>{budget.percent.toFixed(0)}% used</span>
        <span>
          {remaining >= 0
            ? `${formatMoney(remaining)} left`
            : `${formatMoney(Math.abs(remaining))} over`}
        </span>
        <button className="delete-budget" type="button" onClick={() => onDelete(budget.id)}>
          Remove
        </button>
      </div>
    </div>
  );
}
