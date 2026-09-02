# BasseyFlow — Personal Finance Dashboard

A React + Vite personal finance dashboard built to track income, expenses, budgets, and spending insights with a polished, responsive UI.

> **Financial clarity. Smarter cash flow.**

## Technologies

- React 18
- Vite
- CSS3 (custom properties, dark/light theme)
- Browser localStorage

## Architecture

- **State management** — `useReducer` in `src/hooks/useFinanceData.js` with actions for adding, editing, deleting transactions and budgets, loading demo data, clearing all data, and managing filter/sort/editing state.
- **Custom hooks** — `useLocalStorage` for persistence, `useTheme` for dark/light mode toggling.
- **Derived state** — `useMemo` recomputes summary cards (balance, income, expenses, savings rate), filtered and sorted transactions, budget progress stats, and spending insights on every relevant state change.
- **Components** — focused, single-responsibility components in `src/components/`:
  - `TransactionForm` — controlled form with inline validation
  - `TransactionItem` — individual transaction row with edit/delete actions
  - `TransactionList` — renders filtered transactions or empty state
  - `SummaryCards` — balance, income, expenses, and savings rate
  - `BudgetForm` — controlled budget creation/update form
  - `BudgetItem` — budget card with progress bar and over-limit styling
  - `BudgetList` — renders all budgets
  - `FilterBar` — search, type filter, category filter, and sort controls
  - `InsightsPanel` — top spending category, average expense, active budget count
  - `ThemeToggle` — dark/light mode button

## Features

- Add, edit, and delete transactions with inline validation
- Income and expense tracking with $ currency formatting via `Intl.NumberFormat`
- Automatic balance, income, expense, and savings-rate calculations
- Search transactions by description
- Filter by type (income/expense) and category
- Sort by newest, oldest, highest amount, and lowest amount
- Category budgets with animated progress bars
- Budget warning (≥80%) and over-limit (≥100%) states
- LocalStorage persistence for transactions, budgets, and theme preference
- Dark/light mode toggle with system-wide persistence
- Spending insights panel (top category, average expense, active budget count)
- Responsive mobile layout
- Demo data loader for quick testing
- Clear all data with confirmation dialog
- Toast notifications on add, update, and delete actions

## How to run

```bash
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

## Live Demo

[https://my-cash-flow-dashboard-phi.vercel.app/](https://my-cash-flow-dashboard-phi.vercel.app/)

## Build for production

```bash
npm run build
```
