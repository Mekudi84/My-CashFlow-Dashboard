import TransactionItem from "./TransactionItem";

export default function TransactionList({ transactions, onEdit, onDelete, hasActiveFilters, onClearFilters, onLoadDemo }) {
  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">$</div>
        <h3>No transactions yet</h3>
        <p>Add your first income or expense to start tracking your finances.</p>
        {hasActiveFilters ? (
          <button type="button" className="btn ghost empty-cta" onClick={onClearFilters}>
            Clear filters
          </button>
        ) : (
          <button type="button" className="btn primary empty-cta" onClick={onLoadDemo}>
            Explore Demo Data
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
