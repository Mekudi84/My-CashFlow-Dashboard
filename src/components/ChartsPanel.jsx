import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatMoney } from "../utils/currency";

function getMonthLabel(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleString("en-US", { month: "short" });
}

function getChartData(transactions, currency) {
  const monthly = {};

  transactions.forEach(({ date, type, amount }) => {
    const d = new Date(`${date}T00:00:00`);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthly[key]) {
      monthly[key] = { month: key, income: 0, expenses: 0 };
    }
    if (type === "income") {
      monthly[key].income += Number(amount);
    } else {
      monthly[key].expenses += Number(amount);
    }
  });

  const sorted = Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
  return sorted.map((item) => ({
    ...item,
    monthLabel: getMonthLabel(item.month + "-01"),
  }));
}

function CustomTooltip({ active, payload, label, currency }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }}>
          {entry.name === "income" ? "Income" : "Expenses"}: {formatMoney(entry.value, currency)}
        </p>
      ))}
    </div>
  );
}

export default function ChartsPanel({ transactions, currency = "NGN" }) {
  const data = useMemo(() => getChartData(transactions, currency), [transactions, currency]);

  if (data.length === 0) {
    return (
      <section className="panel chart-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">TRENDS</p>
            <h2>Income vs Expenses</h2>
          </div>
        </div>
        <div className="chart-empty">
          <div className="empty-icon">📊</div>
          <h3>No transactions yet</h3>
          <p>Add income or expenses to see your financial trends over time.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">TRENDS</p>
          <h2>Income vs Expenses</h2>
        </div>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="monthLabel"
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={{ stroke: "var(--border)" }}
              tickFormatter={(value) => formatMoney(value, currency)}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Legend />
            <Bar dataKey="income" name="Income" fill="var(--green)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="var(--red)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
