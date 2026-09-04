// Mock financial data for the demo Finance Tracker dashboard.
// Frontend-only; no backend, no auth, no bank connections.

export const CURRENCY = "USD";

export const MOCK_BUDGETS = [
  { id: "b1", category: "Food & Dining", spent: 620, limit: 800 },
  { id: "b2", category: "Transportation", spent: 310, limit: 500 },
  { id: "b3", category: "Entertainment", spent: 280, limit: 400 },
  { id: "b4", category: "Shopping", spent: 540, limit: 700 },
  { id: "b5", category: "Utilities", spent: 320, limit: 450 },
];

export const MOCK_SAVINGS_GOALS = [
  { id: "g1", name: "Emergency Fund", current: 7500, target: 10000, targetDate: "2026-12-31" },
  { id: "g2", name: "Vacation", current: 2800, target: 5000, targetDate: "2026-08-15" },
  { id: "g3", name: "New Car", current: 6400, target: 20000, targetDate: "2027-06-30" },
];

export const CATEGORIES = [
  "Housing",
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Travel",
  "Subscriptions",
  "Other",
];

const today = new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return iso(d);
};

export const MOCK_TRANSACTIONS = [
  { id: "t1", name: "Whole Foods", category: "Food & Dining", date: daysAgo(0), type: "expense", amount: 86.40, status: "completed", description: "Weekly groceries" },
  { id: "t2", name: "Netflix", category: "Subscriptions", date: daysAgo(1), type: "expense", amount: 15.49, status: "completed", description: "Monthly subscription" },
  { id: "t3", name: "Salary", category: "Income", date: daysAgo(2), type: "income", amount: 4250.00, status: "completed", description: "October payroll" },
  { id: "t4", name: "Shell", category: "Transportation", date: daysAgo(3), type: "expense", amount: 64.20, status: "completed", description: "Fuel" },
  { id: "t5", name: "Amazon", category: "Shopping", date: daysAgo(4), type: "expense", amount: 128.90, status: "pending", description: "Household items" },
  { id: "t6", name: "Freelance Project", category: "Income", date: daysAgo(5), type: "income", amount: 850.00, status: "completed", description: "Landing page design" },
  { id: "t7", name: "Rent", category: "Housing", date: daysAgo(6), type: "expense", amount: 1450.00, status: "completed", description: "October rent" },
  { id: "t8", name: "Spotify", category: "Subscriptions", date: daysAgo(7), type: "expense", amount: 9.99, status: "completed", description: "Family plan" },
  { id: "t9", name: "Trader Joe's", category: "Food & Dining", date: daysAgo(8), type: "expense", amount: 42.10, status: "completed", description: "Quick grocery run" },
  { id: "t10", name: "Electric Bill", category: "Utilities", date: daysAgo(9), type: "expense", amount: 128.55, status: "completed", description: "October electricity" },
  { id: "t11", name: "Uber", category: "Transportation", date: daysAgo(10), type: "expense", amount: 18.30, status: "completed", description: "Ride to airport" },
  { id: "t12", name: "Cinema", category: "Entertainment", date: daysAgo(11), type: "expense", amount: 32.00, status: "completed", description: "Friday movie" },
  { id: "t13", name: "Pharmacy", category: "Healthcare", date: daysAgo(12), type: "expense", amount: 24.75, status: "completed", description: "Vitamins" },
  { id: "t14", name: "Dividends", category: "Income", date: daysAgo(13), type: "income", amount: 312.40, status: "completed", description: "Quarterly dividend" },
  { id: "t15", name: "Starbucks", category: "Food & Dining", date: daysAgo(14), type: "expense", amount: 6.85, status: "completed", description: "Morning coffee" },
];

export const MOCK_INSIGHTS = [
  { id: "i1", icon: "↓", tone: "positive", title: "You spent 12% less this month.", body: "Great discipline — your outflow dropped across Food & Dining and Entertainment." },
  { id: "i2", icon: "◉", tone: "info", title: "Food & Dining is your second-largest category.", body: "Currently 23% of total spending. Try meal planning to reduce by 10%." },
  { id: "i3", icon: "✓", tone: "positive", title: "You saved 28% of your income this month.", body: "Above the recommended 20% savings rate. Keep going." },
  { id: "i4", icon: "◔", tone: "warning", title: "$180 left in your entertainment budget.", body: "You are 70% through this category for the month." },
  { id: "i5", icon: "↑", tone: "info", title: "Expenses decreased vs last month.", body: "Outflow is down 4.1% compared with September." },
  { id: "i6", icon: "◆", tone: "positive", title: "Your savings increased by $620 this month.", body: "Driven by higher income and reduced discretionary spending." },
];

const monthLabel = (n) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toLocaleString("en-US", { month: "short" });
};

const baseMonthlyIncome = [4100, 4300, 4250, 6800, 4500, 5100, 4400, 5200, 4300, 7400, 4600, 7250];
const baseMonthlyExpenses = [3800, 3920, 4050, 4100, 4200, 4400, 4080, 4180, 4150, 4250, 4280, 4100];

export function getCashFlowData(range = "6M") {
  const ranges = { "7D": 1, "30D": 1, "3M": 3, "6M": 6, "1Y": 12 };
  const months = ranges[range] ?? 6;
  const now = new Date();
  const data = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const idx = 11 - i;
    const noise = (Math.sin((idx + 1) * 1.3) * 220) | 0;
    const income = Math.max(1500, (baseMonthlyIncome[idx] ?? 4500) + noise);
    const expenses = Math.max(1200, (baseMonthlyExpenses[idx] ?? 4100) - noise);
    data.push({
      label: monthLabel(i),
      income: Math.round(income),
      expenses: Math.round(expenses),
    });
  }
  if (range === "7D" || range === "30D") {
    const days = range === "7D" ? 7 : 30;
    const out = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const inc = 200 + Math.round(Math.random() * 120);
      const exp = 80 + Math.round(Math.random() * 90);
      out.push({
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        income: inc,
        expenses: exp,
      });
    }
    return out;
  }
  return data;
}

export const SUMMARY = {
  totalBalance: 24850,
  monthlyIncome: 7450,
  monthlyExpenses: 4280,
  totalSavings: 12600,
  delta: {
    totalBalance: 8.2,
    monthlyIncome: 4.5,
    monthlyExpenses: -4.1,
    totalSavings: 12.4,
  },
};
