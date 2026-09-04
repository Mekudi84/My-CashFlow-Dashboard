const KEYS = {
  transactions: "financeflow_transactions",
  budgets: "financeflow_budgets",
  theme: "financeflow_theme",
};

export const loadData = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error("Could not load data:", error);
    return fallback;
  }
};

export const saveData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Could not save data:", error);
    return false;
  }
};

export const loadTransactions = () => loadData(KEYS.transactions, []);
export const saveTransactions = (items) => saveData(KEYS.transactions, items);
export const loadBudgets = () => loadData(KEYS.budgets, []);
export const saveBudgets = (items) => saveData(KEYS.budgets, items);

export const loadTheme = () => localStorage.getItem(KEYS.theme) || "light";
export const saveTheme = (theme) => localStorage.setItem(KEYS.theme, theme);

export const clearStoredData = () => {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
};
