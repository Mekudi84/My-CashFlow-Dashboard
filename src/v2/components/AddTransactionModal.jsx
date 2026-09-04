import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { formatDate } from "../utils/format";
import { CATEGORIES } from "../data/mockData";

const TODAY = () => new Date().toISOString().slice(0, 10);

export default function AddTransactionModal({ open, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");
  const [type, setType] = useState("expense");
  const [date, setDate] = useState(TODAY());
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (open) {
      setError("");
      setName("");
      setAmount("");
      setCategory("Other");
      setType("expense");
      setDate(TODAY());
      setDescription("");
      const t = setTimeout(() => firstFieldRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!name.trim()) return setError("Please enter a transaction name.");
    if (!Number.isFinite(value) || value <= 0) return setError("Please enter a valid amount greater than zero.");
    if (!date) return setError("Please choose a date.");
    onSubmit({
      name: name.trim(),
      amount: value,
      category,
      type,
      date,
      status: "completed",
      description: description.trim(),
    });
  };

  return (
    <div className="ft-modal-root" role="dialog" aria-modal="true" aria-label="Add transaction">
      <div className="ft-modal-overlay" onClick={onClose} />
      <div className="ft-modal">
        <header className="ft-modal-head">
          <div>
            <p className="ft-eyebrow">NEW TRANSACTION</p>
            <h2>Add transaction</h2>
          </div>
          <button type="button" className="ft-icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </header>

        <form className="ft-modal-form" onSubmit={handleSubmit}>
          <label>
            Transaction name
            <input
              ref={firstFieldRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Whole Foods"
              maxLength={60}
              required
            />
          </label>

          <div className="ft-modal-row">
            <label>
              Amount
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </label>
            <label>
              Date
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>
          </div>

          <div className="ft-modal-row">
            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Type
              <div className="ft-segmented" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={type === "expense"}
                  className={type === "expense" ? "is-active" : ""}
                  onClick={() => setType("expense")}
                >
                  Expense
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={type === "income"}
                  className={type === "income" ? "is-active" : ""}
                  onClick={() => setType("income")}
                >
                  Income
                </button>
              </div>
            </label>
          </div>

          <label>
            Description <span className="ft-optional">(optional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="A short note about this transaction"
            />
          </label>

          {error && <div className="ft-modal-error" role="alert">{error}</div>}

          <footer className="ft-modal-foot">
            <button type="button" className="ft-btn ft-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="ft-btn ft-btn-primary">Add transaction</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
