export default function Sidebar({ active, onSelect, onSignOut, user }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: "◧" },
    { id: "transactions", label: "Transactions", icon: "↔" },
    { id: "budgets", label: "Budgets", icon: "◐" },
    { id: "insights", label: "Insights", icon: "◈" },
  ];

  const emailInitial = (user?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar-brand">
        <img
          src="/basseyflow-logo.svg"
          alt="BasseyFlow"
          className="brand-logo"
        />
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

      {user && (
        <div className="sidebar-account" aria-label="Signed in account">
          <div className="sidebar-avatar" aria-hidden="true">{emailInitial}</div>
          <div className="sidebar-account-meta">
            <strong title={user.email}>{user.user_metadata?.full_name || user.email}</strong>
            <small>Signed in</small>
          </div>
          <button
            type="button"
            className="sidebar-signout"
            onClick={onSignOut}
            aria-label="Sign out"
            title="Sign out"
          >
            ⎋
          </button>
        </div>
      )}

      <div className="sidebar-foot">
        <p className="sidebar-tip">
          <span aria-hidden="true">⌘</span>
          <span>Press <kbd>Esc</kbd> to cancel edits</span>
        </p>
      </div>
    </aside>
  );
}
