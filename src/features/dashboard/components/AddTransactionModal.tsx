import { useEffect, useRef, useState } from "react";
import type { Category, TransactionDraft, TransactionKind } from "@/types";
import { todayIso } from "@/lib/date";

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: Omit<TransactionDraft, "accountId"> & { accountId: string | null }) => void;
  categories: Category[];
}

export default function AddTransactionModal({ open, onClose, onSubmit, categories }: AddTransactionModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? "");
  const [kind, setKind] = useState<TransactionKind>("expense");
  const [date, setDate] = useState(todayIso());
  const [error, setError] = useState("");
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setError("");
      setDescription("");
      setAmount("");
      setCategoryId(categories[0]?.id ?? "");
      setKind("expense");
      setDate(todayIso());
      const t = setTimeout(() => firstFieldRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open, categories]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!description.trim()) return setError("Please enter a description.");
    if (!Number.isFinite(value) || value <= 0)
      return setError("Please enter a valid amount greater than zero.");
    if (!date) return setError("Please choose a date.");
    onSubmit({
      accountId: null,
      categoryId: categoryId || null,
      kind,
      amount: value,
      currency: "USD",
      occurredOn: date,
      description: description.trim(),
      status: "completed",
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
            ✕
          </button>
        </header>

        <form className="ft-modal-form" onSubmit={handleSubmit}>
          <label>
            Description
            <input
              ref={firstFieldRef}
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Whole Foods"
              maxLength={120}
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
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="ft-modal-row">
            <label>
              Category
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="ft-segmented" role="radiogroup" aria-label="Type">
              <legend className="ft-sr-only">Type</legend>
              {(["expense", "income"] as const).map((k) => (
                <label
                  key={k}
                  className={`ft-segmented-option ${kind === k ? "is-active" : ""}`}
                >
                  <input
                    type="radio"
                    name="kind"
                    value={k}
                    checked={kind === k}
                    onChange={() => setKind(k)}
                  />
                  {k === "expense" ? "Expense" : "Income"}
                </label>
              ))}
            </fieldset>
          </div>

          {error && (
            <div className="ft-modal-error" role="alert">
              {error}
            </div>
          )}

          <footer className="ft-modal-foot">
            <button type="button" className="ft-btn ft-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ft-btn ft-btn-primary">
              Add transaction
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}