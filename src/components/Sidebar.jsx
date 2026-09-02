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
        <span className="brand-mark" aria-hidden="true">◆</span>
        <div className="brand-text">
          <strong>Cowrywise</strong>
          <small>Personal finance</small>
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
