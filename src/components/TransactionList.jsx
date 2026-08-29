import TransactionItem from "./TransactionItem";

export default function TransactionList({ transactions, onEdit, onDelete }) {
  return (
    <>
      {transactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">₦</div>
          <h3>No transactions yet</h3>
          <p>Add your first income or expense to start tracking your finances.</p>
        </div>
      ) : (
        <div className="transaction-list">
          {transactions.map((t) => (
            <TransactionItem
              key={t.id}
              transaction={t}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </>
  );
}
