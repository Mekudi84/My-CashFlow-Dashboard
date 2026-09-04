import { useState } from "react";
import Icon from "./Icon";

const NAV = [
  { id: "overview", label: "Overview", icon: "overview" },
  { id: "transactions", label: "Transactions", icon: "transactions" },
  { id: "budgets", label: "Budgets", icon: "budgets" },
  { id: "savings", label: "Savings Goals", icon: "savings" },
  { id: "reports", label: "Reports", icon: "reports" },
  { id: "settings", label: "Settings", icon: "settings" },
];

export default function Sidebar({ active, onSelect, collapsed, onToggleCollapse }) {
  return (
    <aside className={`ft-sidebar ${collapsed ? "is-collapsed" : ""}`} aria-label="Primary">
      <div className="ft-sidebar-head">
        <div className="ft-brand">
          <div className="ft-brand-mark" aria-hidden="true">
            ◆
          </div>
          {!collapsed && (
            <div className="ft-brand-text">
              <strong>FinanceFlow</strong>
              <small>Personal tracker</small>
            </div>
          )}
        </div>
        <button
          type="button"
          className="ft-collapse-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon
            name={collapsed ? "arrowUp" : "arrowDown"}
            size={14}
            style={{ transform: collapsed ? "rotate(90deg)" : "rotate(-90deg)" }}
          />
        </button>
      </div>

      <nav className="ft-nav">
        {NAV.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className={`ft-nav-item ${active === item.id ? "is-active" : ""}`}
            onClick={() => onSelect?.(item.id)}
            style={{ "--nav-index": i }}
            title={collapsed ? item.label : undefined}
            aria-current={active === item.id ? "page" : undefined}
          >
            <span className="ft-nav-icon">
              <Icon name={item.icon} size={18} />
            </span>
            {!collapsed && <span className="ft-nav-label">{item.label}</span>}
            {active === item.id && <span className="ft-nav-indicator" aria-hidden="true" />}
          </button>
        ))}
      </nav>

      <div className="ft-sidebar-foot">
        {!collapsed && (
          <div className="ft-plan-card">
            <div className="ft-plan-title">Pro tip</div>
            <p>Set a monthly savings goal and track your progress automatically.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
