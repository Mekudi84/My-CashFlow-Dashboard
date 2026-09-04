import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { StoreProvider, useStore } from "./store";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import SummaryCards from "./components/SummaryCards";
import CashFlowChart from "./components/CashFlowChart";
import IncomeVsExpenses from "./components/IncomeVsExpenses";
import SpendingBreakdown from "./components/SpendingBreakdown";
import BudgetTracker from "./components/BudgetTracker";
import RecentTransactions from "./components/RecentTransactions";
import TransactionDrawer from "./components/TransactionDrawer";
import SavingsGoals from "./components/SavingsGoals";
import FinancialInsights from "./components/FinancialInsights";
import MonthlySummary from "./components/MonthlySummary";
import TransactionFilters from "./components/TransactionFilters";
import AddTransactionModal from "./components/AddTransactionModal";
import { SUMMARY } from "./data/mockData";

function DashboardInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    transactions,
    budgets,
    savingsGoals,
    insights,
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useStore();

  const active = location.pathname.replace("/v2", "").replace(/^\//, "") || "overview";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState("6M");
  const [filters, setFilters] = useState({ type: "all", category: "all", status: "all" });
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    return undefined;
  }, [mobileOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (filters.type !== "all" && t.type !== filters.type) return false;
      if (filters.category !== "all" && t.category !== filters.category) return false;
      if (filters.status !== "all" && t.status !== filters.status) return false;
      if (q && !`${t.name} ${t.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [transactions, query, filters]);

  const monthlyTotals = useMemo(() => {
    const inc = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const exp = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income: inc, expenses: exp };
  }, [filtered]);

  const categoryTotals = useMemo(() => {
    const totals = {};
    filtered
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
      });
    return totals;
  }, [filtered]);

  const totalExpenses = useMemo(
    () => Object.values(categoryTotals).reduce((s, v) => s + v, 0),
    [categoryTotals],
  );

  const largestCategory = useMemo(() => {
    const entries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0];
  }, [categoryTotals]);

  const summary = {
    ...SUMMARY,
    monthlyIncome: monthlyTotals.income || SUMMARY.monthlyIncome,
    monthlyExpenses: monthlyTotals.expenses || SUMMARY.monthlyExpenses,
  };

  const handleNav = (id) => {
    navigate(`/v2/${id}`);
    setMobileOpen(false);
  };

  const handleAdd = (tx) => {
    addTransaction(tx);
    setShowAdd(false);
  };

  const handleSelect = (t) => {
    setSelected(t);
    setDrawerOpen(true);
  };

  return (
    <div
      className={`ft-shell ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "has-mobile" : ""}`}
    >
      <Sidebar
        active={active}
        onSelect={handleNav}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />

      <div className="ft-main">
        <Topbar
          query={query}
          onQuery={setQuery}
          dateRange={dateRange}
          onDateRange={setDateRange}
          onOpenAdd={() => setShowAdd(true)}
          onMenu={() => setMobileOpen(true)}
        />

        <main className="ft-content">
          <header className="ft-page-head">
            <div>
              <p className="ft-eyebrow">FINANCE OVERVIEW</p>
              <h1>Hello, here’s your money snapshot</h1>
              <p className="ft-subtitle">
                Track your money and stay on top of your financial goals.
              </p>
            </div>
          </header>

          <SummaryCards summary={summary} loading={loading} />

          <div className="ft-row-2">
            <CashFlowChart range={dateRange} onRange={setDateRange} loading={loading} />
            <IncomeVsExpenses
              income={summary.monthlyIncome}
              expenses={summary.monthlyExpenses}
              loading={loading}
            />
          </div>

          <div className="ft-row-2">
            <SpendingBreakdown
              categoryTotals={categoryTotals}
              total={totalExpenses}
              loading={loading}
            />
            <BudgetTracker budgets={budgets} loading={loading} />
          </div>

          <section className="ft-section">
            <header className="ft-section-head">
              <div>
                <p className="ft-eyebrow">TRANSACTIONS</p>
                <h2>Transactions</h2>
              </div>
            </header>
            <TransactionFilters
              filters={filters}
              categories={categories}
              onChange={setFilters}
              onReset={() => setFilters({ type: "all", category: "all", status: "all" })}
            />
            <RecentTransactions
              transactions={filtered}
              onSelect={handleSelect}
              loading={loading}
              count={10}
            />
          </section>

          <div className="ft-row-2">
            <SavingsGoals goals={savingsGoals} loading={loading} />
            <MonthlySummary summary={summary} largestCategory={largestCategory} loading={loading} />
          </div>

          <FinancialInsights insights={insights} loading={loading} />
        </main>
      </div>

      {mobileOpen && <div className="ft-mobile-overlay" onClick={() => setMobileOpen(false)} />}

      <AddTransactionModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAdd} />

      <TransactionDrawer
        transaction={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={(patch) => updateTransaction(selected.id, patch)}
        onDelete={(id) => deleteTransaction(id)}
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <StoreProvider>
      <DashboardInner />
    </StoreProvider>
  );
}
