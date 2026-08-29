import BudgetItem from "./BudgetItem";

export default function BudgetList({ budgetStats, onDeleteBudget }) {
  return (
    <div className="budget-list">
      {budgetStats.length === 0 ? (
        <p className="form-message">No budgets created yet.</p>
      ) : (
        budgetStats.map((budget) => (
          <BudgetItem key={budget.id} budget={budget} onDelete={onDeleteBudget} />
        ))
      )}
    </div>
  );
}
