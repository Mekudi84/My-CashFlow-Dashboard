import Icon from "./Icon";

const STATUSES = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "pending", label: "Pending" },
];

const TYPES = [
  { id: "all", label: "All" },
  { id: "income", label: "Income" },
  { id: "expense", label: "Expense" },
];

export default function TransactionFilters({ filters, categories, onChange, onReset }) {
  const update = (patch) => onChange({ ...filters, ...patch });
  const hasActive =
    filters.type !== "all" || filters.category !== "all" || filters.status !== "all";

  return (
    <section className="ft-filters" aria-label="Transaction filters">
      <div className="ft-filter-group">
        <span className="ft-filter-label">Type</span>
        <div className="ft-pill-group" role="tablist">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={filters.type === t.id}
              className={`ft-pill-btn ${filters.type === t.id ? "is-active" : ""}`}
              onClick={() => update({ type: t.id })}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <label className="ft-filter-group">
        <span className="ft-filter-label">Category</span>
        <select
          className="ft-select"
          value={filters.category}
          onChange={(e) => update({ category: e.target.value })}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <div className="ft-filter-group">
        <span className="ft-filter-label">Status</span>
        <div className="ft-pill-group" role="tablist">
          {STATUSES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={filters.status === s.id}
              className={`ft-pill-btn ${filters.status === s.id ? "is-active" : ""}`}
              onClick={() => update({ status: s.id })}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {hasActive && (
        <button type="button" className="ft-btn ft-btn-ghost ft-filter-reset" onClick={onReset}>
          <Icon name="close" size={12} /> Clear
        </button>
      )}
    </section>
  );
}
