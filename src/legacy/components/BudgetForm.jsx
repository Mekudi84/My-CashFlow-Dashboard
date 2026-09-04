import { useState } from "react";

export default function BudgetForm({ onAddBudget }) {
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category || !limit || Number(limit) <= 0) {
      setMessage("Choose a category and enter a valid limit.");
      return;
    }
    onAddBudget({
      id: Date.now(),
      category,
      limit: Number(limit),
    });
    setCategory("");
    setLimit("");
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="budget-form" novalidate>
      <label>
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Choose category</option>
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
      </label>
      <label>
        Limit
        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="50000"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />
      </label>
      <button className="btn secondary" type="submit">Set Budget</button>
      {message && <p className="form-message" style={{ gridColumn: "1 / -1" }}>{message}</p>}
    </form>
  );
}
