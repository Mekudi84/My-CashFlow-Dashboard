import { useEffect, useMemo } from "react";
import { useNavigate, useLocation, Navigate, Route, Routes } from "react-router-dom";
import { useUiStore } from "@/store/ui";
import {
  useBudgets,
  useCashFlow,
  useCategories,
  useCreateTransaction,
  useDeleteTransaction,
  useGoals,
  useSpendingByCategory,
  useSummary,
  useTransactions,
  useUpdateTransaction,
} from "./hooks/queries";
import { filterTransactions, monthlyTotals } from "./utils/analytics";
import type { Insight } from "./components/FinancialInsights";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import SummaryCards, { type SummaryShape } from "./components/SummaryCards";
import CashFlowChart from "./components/CashFlowChart";
import IncomeVsExpenses from "./components/IncomeVsExpenses";
import SpendingBreakdown from "./components/SpendingBreakdown";
import BudgetTracker from "./components/BudgetTracker";
import RecentTransactions from "./components/RecentTransactions";
import TransactionDrawer from "./components/TransactionDrawer";
import SavingsGoals from "./components/SavingsGoals";
import FinancialInsights from "./components/FinancialInsights";
import MonthlySummary from "./components/MonthlySummary";
import TransactionFilters, { type TransactionFiltersValue } from "./components/TransactionFilters";
import AddTransactionModal from "./components/AddTransactionModal";
import type { Transaction, TransactionDraft } from "@/types";

function buildInsights(
  summary: { monthlyIncomeCents: number; monthlyExpensesCents: number },
  largest: string | null,
): Insight[] {
  const savings = Math.max(0, summary.monthlyIncomeCents - summary.monthlyExpensesCents);
  const rate = summary.monthlyIncomeCents
    ? (savings / summary.monthlyIncomeCents) * 100
    : 0;
  const out: Insight[] = [
    {
      id: "i1",
      icon: "↓",
      tone: "positive",
      title: "You spent less than you earned this month.",
      body: "Keep your outflow below your income to grow your savings.",
    },
    {
      id: "i2",
      icon: "◉",
      tone: "info",
      title: largest ? `${largest} is your largest spending category.` : "Track your top category.",
      body: "Watch this category to keep discretionary spend in check.",
    },
    {
      id: "i3",
      icon: "✓",
      tone: rate >= 20 ? "positive" : "info",
      title: `You saved ${rate.toFixed(1)}% of your income.`,
      body: rate >= 20 ? "Above the recommended 20% savings rate." : "Try to save at least 20%.",
    },
    {
      id: "i4",
      icon: "◆",
      tone: "positive",
      title: "Cash flow trend is improving.",
      body: "Income and expenses are stable. Stay consistent.",
    },
  ];
  return out;
}

export default function Dashboard() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="overview" replace />} />
      <Route path=":section" element={<DashboardLayout />} />
    </Routes>
  );
}

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const ui = useUiStore();
  const summaryQ = useSummary();
  const transactionsQ = useTransactions();
  const budgetsQ = useBudgets();
  const goalsQ = useGoals();
  const categoriesQ = useCategories();
  const cashFlowQ = useCashFlow(ui.dateRange);
  const spendingQ = useSpendingByCategory();

  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
  const deleteTx = useDeleteTransaction();

  const section = location.pathname.replace(/^\/v2\/?/, "") || "overview";

  useEffect(() => {
    if (ui.mobileNavOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    return undefined;
  }, [ui.mobileNavOpen]);

  const loading =
    summaryQ.isLoading ||
    transactionsQ.isLoading ||
    budgetsQ.isLoading ||
    categoriesQ.isLoading ||
    goalsQ.isLoading ||
    spendingQ.isLoading ||
    cashFlowQ.isLoading;

  const transactions = useMemo<Transaction[]>(
    () => transactionsQ.data ?? [],
    [transactionsQ.data],
  );
  const categories = useMemo(
    () => categoriesQ.data ?? [],
    [categoriesQ.data],
  );
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const filtered = useMemo(
    () =>
      filterTransactions(transactions, {
        query: ui.query,
        type: ui.filterType,
        categoryId: ui.filterCategory,
        status: ui.filterStatus,
      }),
    [transactions, ui.query, ui.filterType, ui.filterCategory, ui.filterStatus],
  );

  const totals = useMemo(() => monthlyTotals(filtered), [filtered]);

  const spendingFromApi = spendingQ.data ?? [];
  const spendingFromList = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of filtered) {
      if (t.kind !== "expense" || !t.categoryId) continue;
      map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amountCents);
    }
    return Array.from(map.entries())
      .map(([categoryId, totalCents]) => {
        const c = categoryById.get(categoryId);
        return {
          categoryId,
          categoryName: c?.name ?? "Uncategorized",
          color: c?.color ?? "#64748b",
          totalCents,
        };
      })
      .sort((a, b) => b.totalCents - a.totalCents);
  }, [filtered, categoryById]);

  const spendingDisplay = spendingFromList.length > 0 ? spendingFromList : spendingFromApi;
  const largestCategoryName = spendingDisplay[0]?.categoryName ?? null;

  const summary = summaryQ.data;
  const summaryShape: SummaryShape = {
    totalBalance: (summary?.totalBalanceCents ?? 0) / 100,
    monthlyIncome: (summary?.monthlyIncomeCents ?? totals.incomeCents) / 100,
    monthlyExpenses: (summary?.monthlyExpensesCents ?? totals.expensesCents) / 100,
    totalSavings: (summary?.totalSavingsCents ?? 0) / 100,
    delta: summary?.deltas ?? { balance: 0, income: 0, expenses: 0, savings: 0 },
  };

  const insights = useMemo(
    () =>
      buildInsights(
        { monthlyIncomeCents: totals.incomeCents, monthlyExpensesCents: totals.expensesCents },
        largestCategoryName,
      ),
    [totals.incomeCents, totals.expensesCents, largestCategoryName],
  );

  const filters: TransactionFiltersValue = {
    type: ui.filterType,
    category: ui.filterCategory,
    status: ui.filterStatus,
  };

  const handleAdd = (draft: Omit<TransactionDraft, "accountId"> & { accountId: string | null }) => {
    createTx.mutate(draft);
    ui.closeAddModal();
  };

  const handleSave = (id: string, patch: Partial<Transaction>) => {
    updateTx.mutate({
      id,
      patch: {
        amount: patch.amountCents !== undefined ? patch.amountCents / 100 : undefined,
        description: patch.description,
        categoryId: patch.categoryId,
        kind: patch.kind,
        status: patch.status,
        occurredOn: patch.occurredOn,
      },
    });
  };

  const selectedTransaction = ui.showDrawerId
    ? (transactions.find((t) => t.id === ui.showDrawerId) ?? null)
    : null;

  return (
    <div
      className={`ft-shell ${ui.sidebarCollapsed ? "is-collapsed" : ""} ${ui.mobileNavOpen ? "has-mobile" : ""}`}
    >
      <Sidebar
        active={section}
        onSelect={(id) => {
          navigate(`/v2/${id}`);
          ui.setMobileNav(false);
        }}
        collapsed={ui.sidebarCollapsed}
        onToggleCollapse={ui.toggleSidebar}
      />

      <div className="ft-main">
        <Topbar
          query={ui.query}
          onQuery={ui.setQuery}
          dateRange={ui.dateRange}
          onDateRange={ui.setDateRange}
          onOpenAdd={ui.openAddModal}
          onMenu={() => ui.setMobileNav(true)}
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

          <SummaryCards summary={summaryShape} loading={loading} />

          <div className="ft-row-2">
            <CashFlowChart
              data={cashFlowQ.data ?? []}
              range={ui.dateRange}
              onRange={ui.setDateRange}
              loading={loading}
            />
            <IncomeVsExpenses
              incomeCents={totals.incomeCents}
              expensesCents={totals.expensesCents}
              loading={loading}
            />
          </div>

          <div className="ft-row-2">
            <SpendingBreakdown categories={spendingDisplay} loading={loading} />
            <BudgetTracker
              budgets={budgetsQ.data ?? []}
              categories={categories}
              transactions={transactions}
              loading={loading}
            />
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
              onChange={(v) => {
                ui.setFilterType(v.type);
                ui.setFilterCategory(v.category);
                ui.setFilterStatus(v.status);
              }}
              onReset={ui.resetFilters}
            />
            <RecentTransactions
              transactions={filtered}
              categories={categories}
              onSelect={(t) => ui.openDrawer(t.id)}
              loading={loading}
              count={10}
            />
          </section>

          <div className="ft-row-2">
            <SavingsGoals goals={goalsQ.data ?? []} loading={loading} />
            {summary && (
              <MonthlySummary
                summary={summary}
                largestCategory={largestCategoryName}
                loading={loading}
              />
            )}
          </div>

          <FinancialInsights insights={insights} loading={loading} />
        </main>
      </div>

      {ui.mobileNavOpen && (
        <div className="ft-mobile-overlay" onClick={() => ui.setMobileNav(false)} />
      )}

      <AddTransactionModal
        open={ui.showAddModal}
        onClose={ui.closeAddModal}
        onSubmit={handleAdd}
        categories={categories}
      />

      <TransactionDrawer
        transaction={selectedTransaction}
        categories={categories}
        open={ui.showDrawerId !== null}
        onClose={ui.closeDrawer}
        onSave={handleSave}
        onDelete={(id) => {
          deleteTx.mutate(id);
          ui.closeDrawer();
        }}
      />
    </div>
  );
}