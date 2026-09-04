import { useState, useEffect, useCallback } from "react";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(`${date}T00:00:00`),
  );

const TODAY = () => new Date().toISOString().split("T")[0];

export default function TransactionForm({ editingTransaction, onSubmit, onCancelEdit, formTitle }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(TODAY());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(String(editingTransaction.amount));
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setErrors({});
    }
  }, [editingTransaction]);

  const validate = useCallback(() => {
    const next = {};
    if (!description.trim()) next.description = "Description is required.";
    if (!amount || Number(amount) <= 0) next.amount = "Enter an amount greater than zero.";
    if (!category) next.category = "Choose a category.";
    if (!date) next.date = "Choose a date.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [description, amount, category, date]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      description: description.trim(),
      amount: Number(amount),
      type,
      category,
      date,
    });
  };

  const isEditing = Boolean(editingTransaction);

  return (
    <form onSubmit={handleSubmit} novalidate>
      <input type="hidden" value={editingTransaction?.id || ""} readOnly />

      <label>
        Description
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Monthly salary"
          maxLength={60}
        />
        <small className="error">{errors.description || ""}</small>
      </label>

      <div className="form-row">
        <label>
          Amount
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <small className="error">{errors.amount || ""}</small>
        </label>
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
      </div>

      <div className="form-row">
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Choose category</option>
            <option>Salary</option>
            <option>Freelance</option>
            <option>Food</option>
            <option>Transport</option>
            <option>Rent</option>
            <option>Bills</option>
            <option>Shopping</option>
            <option>Education</option>
            <option>Entertainment</option>
            <option>Health</option>
            <option>Other</option>
          </select>
          <small className="error">{errors.category || ""}</small>
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <small className="error">{errors.date || ""}</small>
        </label>
      </div>

      <div className="form-actions">
        <button className="btn primary" type="submit">
          {isEditing ? "Save Changes" : "Add Transaction"}
        </button>
        {isEditing && (
          <button className="btn ghost" type="button" onClick={onCancelEdit}>
            Cancel Edit
          </button>
        )}
      </div>
    </form>
  );
}
