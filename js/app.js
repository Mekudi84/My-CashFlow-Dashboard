import {
  loadTransactions, saveTransactions, loadBudgets, saveBudgets,
  loadTheme, saveTheme, clearStoredData
} from "./storage.js";
import {
  getIncome, getExpenses, getBalance, getSavingsRate,
  getCategoryExpenses, filterTransactions, sortTransactions, findTransaction
} from "./transactions.js";
import { getBudgetSpent, getBudgetStatus } from "./budget.js";

let transactions = loadTransactions();
let budgets = loadBudgets();
let editingId = null;

const $ = (selector) => document.querySelector(selector);

const elements = {
  form: $("#transactionForm"),
  description: $("#description"),
  amount: $("#amount"),
  type: $("#type"),
  category: $("#category"),
  date: $("#date"),
  transactionId: $("#transactionId"),
  submitBtn: $("#submitBtn"),
  cancelEdit: $("#cancelEdit"),
  formTitle: $("#formTitle"),
  formMessage: $("#formMessage"),
  transactionList: $("#transactionList"),
  emptyState: $("#emptyState"),
  count: $("#transactionCount"),
  balance: $("#balance"),
  income: $("#income"),
  expenses: $("#expenses"),
  savingsRate: $("#savingsRate"),
  savingsText: $("#savingsText"),
  search: $("#search"),
  filterType: $("#filterType"),
  filterCategory: $("#filterCategory"),
  sortBy: $("#sortBy"),
  budgetForm: $("#budgetForm"),
  budgetCategory: $("#budgetCategory"),
  budgetAmount: $("#budgetAmount"),
  budgetList: $("#budgetList"),
  budgetMessage: $("#budgetMessage"),
  themeToggle: $("#themeToggle"),
  toast: $("#toast"),
  insightsContent: $("#insightsContent"),
  loadDemo: $("#loadDemo"),
  clearData: $("#clearData")
};

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-NG", { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(`${date}T00:00:00`));

const today = () => new Date().toISOString().split("T")[0];

const showToast = (message) => {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  setTimeout(() => elements.toast.classList.remove("show"), 2200);
};

const clearErrors = () => {
  document.querySelectorAll(".error").forEach((element) => element.textContent = "");
};

const validateTransaction = () => {
  clearErrors();
  let valid = true;

  if (!elements.description.value.trim()) {
    $("#descriptionError").textContent = "Description is required.";
    valid = false;
  }
  if (!elements.amount.value || Number(elements.amount.value) <= 0) {
    $("#amountError").textContent = "Enter an amount greater than zero.";
    valid = false;
  }
  if (!elements.category.value) {
    $("#categoryError").textContent = "Choose a category.";
    valid = false;
  }
  if (!elements.date.value) {
    $("#dateError").textContent = "Choose a date.";
    valid = false;
  }

  return valid;
};

const resetForm = () => {
  elements.form.reset();
  elements.date.value = today();
  elements.type.value = "expense";
  editingId = null;
  elements.formTitle.textContent = "Add Transaction";
  elements.submitBtn.textContent = "Add Transaction";
  elements.cancelEdit.classList.add("hidden");
  elements.transactionId.value = "";
  clearErrors();
};

const updateCategoryFilter = () => {
  const categories = [...new Set(transactions.map(({ category }) => category))].sort();
  const current = elements.filterCategory.value;
  elements.filterCategory.innerHTML =
    '<option value="all">All categories</option>' +
    categories.map((category) => `<option value="${category}">${category}</option>`).join("");
  elements.filterCategory.value = categories.includes(current) ? current : "all";
};

const renderSummary = () => {
  const income = getIncome(transactions);
  const expenses = getExpenses(transactions);
  const balance = getBalance(transactions);
  const savings = getSavingsRate(transactions);

  elements.income.textContent = formatMoney(income);
  elements.expenses.textContent = formatMoney(expenses);
  elements.balance.textContent = formatMoney(balance);
  elements.savingsRate.textContent = `${Math.max(savings, 0).toFixed(1)}%`;
  elements.savingsText.textContent = income
    ? `${formatMoney(Math.max(balance, 0))} currently saved`
    : "No income recorded yet";
};

const renderTransactions = () => {
  const filtered = filterTransactions(
    transactions,
    elements.search.value,
    elements.filterType.value,
    elements.filterCategory.value
  );
  const sorted = sortTransactions(filtered, elements.sortBy.value);

  elements.count.textContent = `${sorted.length} ${sorted.length === 1 ? "item" : "items"}`;
  elements.emptyState.style.display = sorted.length ? "none" : "block";

  elements.transactionList.innerHTML = sorted.map((transaction) => {
    const sign = transaction.type === "income" ? "+" : "-";
    return `
      <article class="transaction">
        <div class="transaction-main">
          <div class="transaction-title">${escapeHtml(transaction.description)}</div>
          <div class="transaction-meta">${escapeHtml(transaction.category)} · ${formatDate(transaction.date)}</div>
        </div>
        <div class="transaction-amount ${transaction.type}">${sign}${formatMoney(Number(transaction.amount))}</div>
        <div class="actions">
          <button class="action-btn" data-action="edit" data-id="${transaction.id}">Edit</button>
          <button class="action-btn delete" data-action="delete" data-id="${transaction.id}">Delete</button>
        </div>
      </article>
    `;
  }).join("");
};

const renderBudgets = () => {
  elements.budgetList.innerHTML = budgets.length ? budgets.map((budget) => {
    const spent = getBudgetSpent(transactions, budget.category);
    const percent = budget.limit ? (spent / budget.limit) * 100 : 0;
    const width = Math.min(percent, 100);
    const status = getBudgetStatus(budget.limit, spent);
    const remaining = budget.limit - spent;

    return `
      <div class="budget-item">
        <div class="budget-top">
          <strong>${escapeHtml(budget.category)}</strong>
          <span>${formatMoney(spent)} / ${formatMoney(budget.limit)}</span>
        </div>
        <div class="progress">
          <div class="progress-bar ${status}" style="width:${width}%"></div>
        </div>
        <div class="budget-meta">
          <span>${percent.toFixed(0)}% used</span>
          <span>${remaining >= 0 ? `${formatMoney(remaining)} left` : `${formatMoney(Math.abs(remaining))} over`}</span>
          <button class="delete-budget" data-budget-id="${budget.id}">Remove</button>
        </div>
      </div>
    `;
  }).join("") : `<p class="form-message">No budgets created yet.</p>`;
};

const renderInsights = () => {
  const expenses = transactions.filter(({ type }) => type === "expense");
  const categoryTotals = expenses.reduce((result, transaction) => {
    result[transaction.category] = (result[transaction.category] || 0) + Number(transaction.amount);
    return result;
  }, {});

  const categories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCategory = categories[0];
  const average = expenses.length
    ? expenses.reduce((sum, { amount }) => sum + Number(amount), 0) / expenses.length
    : 0;

  elements.insightsContent.innerHTML = `
    <div class="insight">
      <span>Top spending category</span>
      <strong>${topCategory ? `${escapeHtml(topCategory[0])} — ${formatMoney(topCategory[1])}` : "No expenses yet"}</strong>
    </div>
    <div class="insight">
      <span>Average expense</span>
      <strong>${expenses.length ? formatMoney(average) : "₦0.00"}</strong>
    </div>
    <div class="insight">
      <span>Budget categories</span>
      <strong>${budgets.length} active budget${budgets.length === 1 ? "" : "s"}</strong>
    </div>
  `;
};

const render = () => {
  renderSummary();
  updateCategoryFilter();
  renderTransactions();
  renderBudgets();
  renderInsights();
};

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateTransaction()) return;

  const transaction = {
    id: editingId ?? Date.now(),
    description: elements.description.value.trim(),
    amount: Number(elements.amount.value),
    type: elements.type.value,
    category: elements.category.value,
    date: elements.date.value
  };

  if (editingId) {
    transactions = transactions.map((item) =>
      item.id === editingId ? transaction : item
    );
    showToast("Transaction updated.");
  } else {
    transactions = [transaction, ...transactions];
    showToast("Transaction added.");
  }

  saveTransactions(transactions);
  resetForm();
  render();
});

elements.cancelEdit.addEventListener("click", resetForm);

elements.transactionList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const transaction = findTransaction(transactions, id);
  if (!transaction) return;

  if (button.dataset.action === "delete") {
    transactions = transactions.filter(({ id: transactionId }) => transactionId !== id);
    saveTransactions(transactions);
    showToast("Transaction deleted.");
    render();
    return;
  }

  editingId = id;
  elements.description.value = transaction.description;
  elements.amount.value = transaction.amount;
  elements.type.value = transaction.type;
  elements.category.value = transaction.category;
  elements.date.value = transaction.date;
  elements.formTitle.textContent = "Edit Transaction";
  elements.submitBtn.textContent = "Save Changes";
  elements.cancelEdit.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

[elements.search, elements.filterType, elements.filterCategory, elements.sortBy]
  .forEach((element) => element.addEventListener("input", renderTransactions));

elements.budgetForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const category = elements.budgetCategory.value;
  const limit = Number(elements.budgetAmount.value);

  if (!category || limit <= 0) {
    elements.budgetMessage.textContent = "Choose a category and enter a valid limit.";
    return;
  }

  const existing = budgets.find((budget) => budget.category === category);

  if (existing) {
    budgets = budgets.map((budget) =>
      budget.category === category ? { ...budget, limit } : budget
    );
    showToast("Budget updated.");
  } else {
    budgets = [...budgets, { id: Date.now(), category, limit }];
    showToast("Budget created.");
  }

  saveBudgets(budgets);
  elements.budgetForm.reset();
  elements.budgetMessage.textContent = "";
  render();
});

elements.budgetList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-budget-id]");
  if (!button) return;

  const id = Number(button.dataset.budgetId);
  budgets = budgets.filter(({ id: budgetId }) => budgetId !== id);
  saveBudgets(budgets);
  showToast("Budget removed.");
  render();
});

elements.themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
  document.body.classList.toggle("dark", nextTheme === "dark");
  elements.themeToggle.textContent = nextTheme === "dark" ? "☀️" : "🌙";
  saveTheme(nextTheme);
});

elements.loadDemo.addEventListener("click", () => {
  const demoDate = today();
  transactions = [
    { id: 1, description: "Monthly Salary", amount: 250000, type: "income", category: "Salary", date: demoDate },
    { id: 2, description: "Freelance Website", amount: 85000, type: "income", category: "Freelance", date: demoDate },
    { id: 3, description: "House Rent", amount: 70000, type: "expense", category: "Rent", date: demoDate },
    { id: 4, description: "Groceries", amount: 32000, type: "expense", category: "Food", date: demoDate },
    { id: 5, description: "Transport", amount: 15000, type: "expense", category: "Transport", date: demoDate },
    { id: 6, description: "Online Course", amount: 18000, type: "expense", category: "Education", date: demoDate }
  ];
  budgets = [
    { id: 101, category: "Food", limit: 50000 },
    { id: 102, category: "Transport", limit: 30000 },
    { id: 103, category: "Entertainment", limit: 20000 }
  ];
  saveTransactions(transactions);
  saveBudgets(budgets);
  showToast("Demo data loaded.");
  render();
});

elements.clearData.addEventListener("click", () => {
  if (!confirm("Delete all transactions, budgets and saved preferences?")) return;
  transactions = [];
  budgets = [];
  clearStoredData();
  document.body.classList.remove("dark");
  elements.themeToggle.textContent = "🌙";
  resetForm();
  showToast("All data cleared.");
  render();
});

const initialTheme = loadTheme();
document.body.classList.toggle("dark", initialTheme === "dark");
elements.themeToggle.textContent = initialTheme === "dark" ? "☀️" : "🌙";
elements.date.value = today();
render();
