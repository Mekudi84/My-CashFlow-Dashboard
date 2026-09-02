export default function Sidebar({ active, onSelect }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: "◧" },
    { id: "transactions", label: "Transactions", icon: "↔" },
    { id: "budgets", label: "Budgets", icon: "◐" },
    { id: "insights", label: "Insights", icon: "◈" },
  ];

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar-brand">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="22" height="22" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="basseyflow-mark" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#82a4ff" />
                <stop offset="100%" stopColor="#3a5cd8" />
              </linearGradient>
            </defs>
            <path
              d="M8 24 L8 8 Q8 6 10 6 L19 6 Q24 6 24 11 Q24 14.5 21 15.5 Q24.5 16.5 24.5 20.5 Q24.5 26 19 26 L10 26 Q8 26 8 24 Z M12 10 L12 14 L18 14 Q20 14 20 12 Q20 10 18 10 Z M12 18 L12 22 L19 22 Q21 22 21 20 Q21 18 19 18 Z"
              fill="url(#basseyflow-mark)"
            />
            <path d="M26 9 L29 6 L29 12 Z" fill="#45c993" />
          </svg>
        </span>
        <div className="brand-text">
          <strong>BasseyFlow</strong>
          <small>Financial clarity · Smarter cash flow</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${active === item.id ? "is-active" : ""}`}
            onClick={() => onSelect?.(item.id)}
            aria-current={active === item.id ? "page" : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {active === item.id && <span className="nav-indicator" aria-hidden="true" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <p className="sidebar-tip">
          <span aria-hidden="true">⌘</span>
          <span>Press <kbd>Esc</kbd> to cancel edits</span>
        </p>
      </div>
    </aside>
  );
}
