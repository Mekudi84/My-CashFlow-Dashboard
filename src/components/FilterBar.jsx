import { useMemo } from "react";

export default function FilterBar({
  search,
  onSearchChange,
  filterType,
  onTypeChange,
  filterCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories,
  count,
}) {
  const categoryOptions = useMemo(() => {
    return ["all", ...categories];
  }, [categories]);

  return (
    <div className="controls">
      <label className="search">
        <span>⌕</span>
        <input
          type="search"
          placeholder="Search description..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </label>
      <select value={filterType} onChange={(e) => onTypeChange(e.target.value)}>
        <option value="all">All types</option>
        <option value="income">Income</option>
        <option value="expense">Expenses</option>
      </select>
      <select value={filterCategory} onChange={(e) => onCategoryChange(e.target.value)}>
        {categoryOptions.map((cat) => (
          <option key={cat} value={cat}>
            {cat === "all" ? "All categories" : cat}
          </option>
        ))}
      </select>
      <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="high">Highest amount</option>
        <option value="low">Lowest amount</option>
      </select>
    </div>
  );
}
