import { useEffect, useState } from "react";
import Icon from "./Icon";
import type { DateRangeKey } from "@/types";
import { useAuthStore } from "@/store/auth";

interface TopbarProps {
  query: string;
  onQuery: (q: string) => void;
  dateRange: DateRangeKey;
  onDateRange: (r: DateRangeKey) => void;
  onOpenAdd: () => void;
  onMenu: () => void;
}

export default function Topbar({ query, onQuery, dateRange, onDateRange, onOpenAdd, onMenu }: TopbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.assign("/login");
  };

  return (
    <header className={`ft-topbar ${scrolled ? "is-scrolled" : ""}`}>
      <div className="ft-topbar-left">
        <button
          type="button"
          className="ft-icon-btn ft-menu-btn"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <Icon name="menu" size={18} />
        </button>
        <label className="ft-search">
          <Icon name="search" size={16} />
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search transactions…"
            aria-label="Search transactions"
          />
        </label>
      </div>
      <div className="ft-topbar-right">
        <select
          className="ft-select"
          value={dateRange}
          onChange={(e) => onDateRange(e.target.value as DateRangeKey)}
          aria-label="Date range"
        >
          <option value="7D">Last 7 days</option>
          <option value="30D">Last 30 days</option>
          <option value="3M">Last 3 months</option>
          <option value="6M">Last 6 months</option>
          <option value="1Y">Last 12 months</option>
        </select>
        <button type="button" className="ft-icon-btn" aria-label="Notifications">
          <Icon name="bell" size={18} />
          <span className="ft-dot" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="ft-avatar"
          aria-label={user ? `Account menu for ${user.name}` : "Account menu"}
          onClick={handleLogout}
          title="Sign out"
        >
          <span>{user?.name?.[0]?.toUpperCase() ?? "U"}</span>
        </button>
        <button type="button" className="ft-btn ft-btn-primary" onClick={onOpenAdd}>
          <Icon name="plus" size={16} />
          <span>Add Transaction</span>
        </button>
      </div>
    </header>
  );
}