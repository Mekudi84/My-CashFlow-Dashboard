import TransactionItem from "./TransactionItem";

export default function TransactionList({ transactions, onEdit, onDelete, hasActiveFilters, onClearFilters }) {
  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">$</div>
        <h3>No transactions yet</h3>
        <p>Start by adding your first transaction to see your financial activity here.</p>
        {hasActiveFilters && (
          <button type="button" className="btn ghost empty-cta" onClick={onClearFilters}>
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {transactions.map((t) => (
        <TransactionItem key={t.id} transaction={t} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
