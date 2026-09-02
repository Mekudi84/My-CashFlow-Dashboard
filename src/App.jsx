import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useFinanceData } from "./hooks/useFinanceData";
import { useTheme } from "./hooks/useTheme";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useAuth } from "./contexts/AuthContext";
import { CURRENCIES, DEFAULT_CURRENCY } from "./utils/currency";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import SummaryCards from "./components/SummaryCards";
import BudgetForm from "./components/BudgetForm";
import BudgetList from "./components/BudgetList";
import InsightsPanel from "./components/InsightsPanel";
import FilterBar from "./components/FilterBar";
import ThemeToggle from "./components/ThemeToggle";
import CurrencySelector from "./components/CurrencySelector";
import ChartsPanel from "./components/ChartsPanel";
import Sidebar from "./components/Sidebar";
import ExpenseBreakdown from "./components/ExpenseBreakdown";
import ProtectedRoute from "./components/ProtectedRoute";
import SignIn from "./components/auth/SignIn";
import SignUp from "./components/auth/SignUp";
import VerifyOtp from "./components/auth/VerifyOtp";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import SetupRequired from "./components/auth/SetupRequired";
import AuthCallback from "./components/auth/AuthCallback";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
}

function getMonthYear() {
  const now = new Date();
  return now.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function scrollToSection(id) {
  if (typeof document === "undefined") return;
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Dashboard() {
  const {
    state,
    dispatch,
    summary,
    categories,
    filteredTransactions,
    budgetStats,
    insights,
    loading,
    error,
    addTransaction,
    editTransaction,
    deleteTransaction,
    addBudget,
    deleteBudget,
    clearAll,
    TODAY,
  } = useFinanceData();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [currency, setCurrency] = useLocalStorage("basseyflow_currency", DEFAULT_CURRENCY);
  const [activeSection, setActiveSection] = useState("dashboard");
  const toastTimeout = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (state.toast) {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => {
        dispatch({ type: "DISMISS_TOAST" });
      }, 2400);
    }
  }, [state.toast, dispatch]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape" && state.editingId) {
        dispatch({ type: "CANCEL_EDIT" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.editingId, dispatch]);

  const handleSubmitTransaction = useCallback(
    async (data) => {
      try {
        if (state.editingId) {
          await editTransaction({ ...data, id: state.editingId });
        } else {
          await addTransaction({ ...data });
        }
      } catch (err) {
        dispatch({ type: "DISMISS_TOAST" });
        alert(formatFinanceError(err));
      }
    },
    [state.editingId, addTransaction, editTransaction, dispatch]
  );

  const handleEdit = useCallback(
    (id) => {
      dispatch({ type: "START_EDIT", payload: id });
      scrollToSection("transactions");
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!confirm("Delete this transaction?")) return;
      try {
        await deleteTransaction(id);
      } catch (err) {
        alert(formatFinanceError(err));
      }
    },
    [deleteTransaction]
  );

  const handleAddBudget = useCallback(
    async (budget) => {
      try {
        await addBudget(budget);
      } catch (err) {
        alert(formatFinanceError(err));
      }
    },
    [addBudget]
  );

  const handleDeleteBudget = useCallback(
    async (id) => {
      try {
        await deleteBudget(id);
      } catch (err) {
        alert(formatFinanceError(err));
      }
    },
    [deleteBudget]
  );

  const handleClearAll = useCallback(async () => {
    if (!confirm("Delete all your transactions, budgets and preferences?")) return;
    try {
      await clearAll();
      localStorage.removeItem("basseyflow_currency");
      localStorage.removeItem("basseyflow_theme");
    } catch (err) {
      alert(formatFinanceError(err));
    }
  }, [clearAll]);

  const handleClearFilters = useCallback(() => {
    dispatch({ type: "SET_SEARCH", payload: "" });
    dispatch({ type: "SET_FILTER_TYPE", payload: "all" });
    dispatch({ type: "SET_FILTER_CATEGORY", payload: "all" });
  }, [dispatch]);

  const handleCardAction = useCallback(
    (kind) => {
      if (kind === "income") {
        dispatch({ type: "SET_FILTER_TYPE", payload: "income" });
        scrollToSection("transactions");
      } else if (kind === "expense") {
        dispatch({ type: "SET_FILTER_TYPE", payload: "expense" });
        scrollToSection("transactions");
      } else if (kind === "balance") {
        dispatch({ type: "SET_FILTER_TYPE", payload: "all" });
        scrollToSection("transactions");
      }
    },
    [dispatch]
  );

  const handleNav = useCallback((id) => {
    setActiveSection(id);
    if (id === "dashboard") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      scrollToSection(id);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate("/signin", { replace: true });
    } catch (err) {
      alert(err?.message || "Unable to sign out. Please try again.");
    }
  }, [signOut, navigate]);

  const greeting = useMemo(getGreeting, []);
  const monthYear = useMemo(getMonthYear, []);
  const currencySymbol = CURRENCIES[currency]?.symbol || CURRENCIES[DEFAULT_CURRENCY].symbol;
  const firstName = (user?.user_metadata?.full_name || user?.email || "").split(/[\s@]/)[0] || "there";

  const editingTransaction = state.editingId
    ? state.transactions.find((t) => t.id === state.editingId) || null
    : null;

  const hasActiveFilters =
    state.search.trim() !== "" || state.filterType !== "all" || state.filterCategory !== "all";

  if (loading) {
    return (
      <div className="auth-loading" role="status" aria-live="polite">
        <div className="auth-spinner" aria-hidden="true" />
        <p>Loading your secure dashboard…</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar active={activeSection} onSelect={handleNav} onSignOut={handleSignOut} user={user} />

      <div className="app-main">
        <header className="topbar reveal" style={{ "--reveal-delay": "0ms" }}>
          <div className="topbar-left">
            <div className="topbar-brand">
              <img
                src="/basseyflow-logo.svg"
                alt="BasseyFlow"
                className="topbar-logo"
              />
            </div>
            <p className="eyebrow brand-eyebrow">
              <span>BASSEYFLOW</span>
              <span className="brand-tagline">Financial clarity · Smarter cash flow</span>
            </p>
            <h1>
              {greeting}, <span className="user-name">{firstName}</span> <span aria-hidden="true">👋</span>
            </h1>
            <p className="subtitle">Here's your financial overview for {monthYear}.</p>
          </div>
          <div className="topbar-right">
            <div className="month-selector" aria-label="Current month">
              <span className="month-dot" aria-hidden="true" />
              <span className="month-label">{monthYear}</span>
            </div>
            <CurrencySelector currency={currency} onChange={setCurrency} />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button
              type="button"
              className="icon-btn topbar-signout"
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
            >
              ⎋
            </button>
          </div>
        </header>

        {error && (
          <div className="demo-banner reveal" style={{ "--reveal-delay": "60ms" }} role="alert">
            <span className="demo-badge" style={{ background: "var(--red)" }}>ERROR</span>
            <p>{error}</p>
          </div>
        )}

        <main className="container">
          <div className="reveal" style={{ "--reveal-delay": "100ms" }}>
            <SummaryCards
              summary={summary}
              currency={currency}
              transactions={state.transactions}
              onCardAction={handleCardAction}
            />
          </div>

          <section className="grid-two">
            <article className="panel reveal" style={{ "--reveal-delay": "180ms" }} id="transactions-form">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">TRANSACTION</p>
                  <h2>{editingTransaction ? "Edit Transaction" : "Add Transaction"}</h2>
                </div>
              </div>

              <TransactionForm
                editingTransaction={editingTransaction}
                onSubmit={handleSubmitTransaction}
                onCancelEdit={() => dispatch({ type: "CANCEL_EDIT" })}
                formTitle={editingTransaction ? "Edit Transaction" : "Add Transaction"}
              />
            </article>

            <article className="panel reveal" style={{ "--reveal-delay": "220ms" }} id="budgets">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">BUDGETS</p>
                  <h2>Category Budgets</h2>
                </div>
                <span className="count-badge">
                  {state.budgets.length} {state.budgets.length === 1 ? "budget" : "budgets"}
                </span>
              </div>

              <BudgetForm onAddBudget={handleAddBudget} />
              <BudgetList budgetStats={budgetStats} onDeleteBudget={handleDeleteBudget} currency={currency} />
            </article>
          </section>

          <div className="reveal" style={{ "--reveal-delay": "280ms" }}>
            <ChartsPanel transactions={state.transactions} currency={currency} />
          </div>

          <section className="grid-two">
            <div className="reveal" style={{ "--reveal-delay": "320ms" }}>
              <ExpenseBreakdown insights={insights} currency={currency} />
            </div>
            <div className="reveal" style={{ "--reveal-delay": "360ms" }} id="insights">
              <InsightsPanel insights={insights} budgetCount={state.budgets.length} currency={currency} />
            </div>
          </section>

          <section className="panel reveal" style={{ "--reveal-delay": "400ms" }} id="transactions">
            <div className="panel-heading transactions-heading">
              <div>
                <p className="eyebrow">ACTIVITY</p>
                <h2>Recent Transactions</h2>
              </div>
              <div className="heading-actions">
                {state.filterType !== "all" && (
                  <span className="filter-pill">
                    Showing {state.filterType}
                    <button
                      type="button"
                      aria-label="Clear type filter"
                      onClick={() => dispatch({ type: "SET_FILTER_TYPE", payload: "all" })}
                    >
                      ×
                    </button>
                  </span>
                )}
                <span className="count-badge">
                  {filteredTransactions.length} {filteredTransactions.length === 1 ? "item" : "items"}
                </span>
              </div>
            </div>

            <FilterBar
              search={state.search}
              onSearchChange={(val) => dispatch({ type: "SET_SEARCH", payload: val })}
              filterType={state.filterType}
              onTypeChange={(val) => dispatch({ type: "SET_FILTER_TYPE", payload: val })}
              filterCategory={state.filterCategory}
              onCategoryChange={(val) => dispatch({ type: "SET_FILTER_CATEGORY", payload: val })}
              sortBy={state.sortBy}
              onSortChange={(val) => dispatch({ type: "SET_SORT_BY", payload: val })}
              categories={categories}
              count={filteredTransactions.length}
            />

            <TransactionList
              transactions={filteredTransactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currency={currency}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
          </section>

          <section className="footer-actions reveal" style={{ "--reveal-delay": "460ms" }}>
            <button className="btn danger-outline" type="button" onClick={handleClearAll}>
              Clear All Data
            </button>
          </section>
        </main>

        <div className={`toast ${state.toast ? "show" : ""}`} role="status">
          {state.toast || ""}
        </div>
      </div>
    </div>
  );
}

function formatFinanceError(err) {
  const message = (err?.message || "").toLowerCase();
  if (message.includes("row-level security") || message.includes("permission")) {
    return "You don't have permission to modify this record.";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "Network error. Please check your connection and try again.";
  }
  return err?.message || "Something went wrong. Please try again.";
}

export default function App() {
  return (
    <Routes>
      <Route path="/setup" element={<SetupRequired />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/verify" element={<VerifyOtp />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/reset" element={<ResetPassword />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
