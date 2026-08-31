import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useFinanceData } from "./hooks/useFinanceData";
import { useTheme } from "./hooks/useTheme";
import { useLocalStorage } from "./hooks/useLocalStorage";
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

export default function App() {
  const { state, dispatch, summary, categories, filteredTransactions, budgetStats, insights, TODAY } =
    useFinanceData();
  const { theme, toggleTheme } = useTheme();
  const [currency, setCurrency] = useLocalStorage("financeflow_currency", DEFAULT_CURRENCY);
  const toastTimeout = useRef(null);

  useEffect(() => {
    if (state.toast) {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => {
        dispatch({ type: "DISMISS_TOAST" });
      }, 2200);
    }
  }, [state.toast, dispatch]);

  const handleSubmitTransaction = useCallback(
    (data) => {
      if (state.editingId) {
        dispatch({ type: "EDIT_TRANSACTION", payload: { ...data, id: state.editingId } });
      } else {
        dispatch({ type: "ADD_TRANSACTION", payload: { ...data, id: Date.now() } });
      }
    },
    [state.editingId, dispatch]
  );

  const handleEdit = useCallback(
    (id) => {
      dispatch({ type: "START_EDIT", payload: id });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    (id) => {
      if (!confirm("Delete this transaction?")) return;
      dispatch({ type: "DELETE_TRANSACTION", payload: id });
    },
    [dispatch]
  );

  const handleAddBudget = useCallback(
    (budget) => {
      dispatch({ type: "ADD_BUDGET", payload: budget });
    },
    [dispatch]
  );

  const handleDeleteBudget = useCallback(
    (id) => {
      dispatch({ type: "DELETE_BUDGET", payload: id });
    },
    [dispatch]
  );

  const handleLoadDemo = useCallback(() => {
    const demoDate = TODAY();
    dispatch({
      type: "LOAD_DEMO",
      payload: {
        transactions: [
          { id: 1, description: "Monthly Salary", amount: 250000, type: "income", category: "Salary", date: demoDate },
          { id: 2, description: "Freelance Website", amount: 85000, type: "income", category: "Freelance", date: demoDate },
          { id: 3, description: "House Rent", amount: 70000, type: "expense", category: "Rent", date: demoDate },
          { id: 4, description: "Groceries", amount: 32000, type: "expense", category: "Food", date: demoDate },
          { id: 5, description: "Transport", amount: 15000, type: "expense", category: "Transport", date: demoDate },
          { id: 6, description: "Online Course", amount: 18000, type: "expense", category: "Education", date: demoDate },
        ],
        budgets: [
          { id: 101, category: "Food", limit: 50000 },
          { id: 102, category: "Transport", limit: 30000 },
          { id: 103, category: "Entertainment", limit: 20000 },
        ],
      },
    });
  }, [dispatch, TODAY]);

  const handleClearAll = useCallback(() => {
    if (!confirm("Delete all transactions, budgets and saved preferences?")) return;
    localStorage.removeItem("financeflow_transactions");
    localStorage.removeItem("financeflow_budgets");
    localStorage.removeItem("financeflow_theme");
    localStorage.removeItem("financeflow_currency");
    dispatch({ type: "CLEAR_ALL" });
  }, [dispatch]);

  const greeting = useMemo(getGreeting, []);
  const monthYear = useMemo(getMonthYear, []);
  const currencySymbol = CURRENCIES[currency]?.symbol || CURRENCIES[DEFAULT_CURRENCY].symbol;

  const editingTransaction = state.editingId
    ? state.transactions.find((t) => t.id === state.editingId) || null
    : null;

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <p className="eyebrow">COWRYWISE</p>
          <h1>{greeting}, Unyime 👋</h1>
          <p className="subtitle">Here's your financial overview for {new Date().toLocaleString("en-US", { month: "long" })}.</p>
        </div>
        <div className="topbar-right">
          <div className="month-selector" aria-label="Current month">
            <span className="month-label">{monthYear}</span>
            <span className="month-arrow" aria-hidden="true">▼</span>
          </div>
          <CurrencySelector currency={currency} onChange={setCurrency} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <main className="container">
        <SummaryCards summary={summary} currency={currency} />

        <section className="grid-two">
          <article className="panel">
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

          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">BUDGETS</p>
                <h2>Category Budgets</h2>
              </div>
            </div>

            <BudgetForm onAddBudget={handleAddBudget} />
            <BudgetList budgetStats={budgetStats} onDeleteBudget={handleDeleteBudget} currency={currency} />
          </article>
        </section>

        <ChartsPanel transactions={state.transactions} currency={currency} />

        <section className="panel">
          <div className="panel-heading transactions-heading">
            <div>
              <p className="eyebrow">ACTIVITY</p>
              <h2>Transactions</h2>
            </div>
            <span className="count-badge">
              {filteredTransactions.length} {filteredTransactions.length === 1 ? "item" : "items"}
            </span>
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
          />
        </section>

        <InsightsPanel insights={insights} budgetCount={state.budgets.length} currency={currency} />

        <section className="footer-actions">
          <button className="btn ghost" type="button" onClick={handleLoadDemo}>
            Load Demo Data
          </button>
          <button className="btn danger-outline" type="button" onClick={handleClearAll}>
            Clear All Data
          </button>
        </section>
      </main>

      <div className={`toast ${state.toast ? "show" : ""}`} role="status">
        {state.toast || ""}
      </div>
    </>
  );
}
