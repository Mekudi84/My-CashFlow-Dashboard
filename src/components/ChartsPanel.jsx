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

function getChartData(transactions) {
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
  const income = payload.find((p) => p.dataKey === "income")?.value || 0;
  const expenses = payload.find((p) => p.dataKey === "expenses")?.value || 0;
  const net = income - expenses;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      <p style={{ color: "var(--green)" }}>Income · {formatMoney(income, currency)}</p>
      <p style={{ color: "var(--red)" }}>Expenses · {formatMoney(expenses, currency)}</p>
      <p style={{ color: net >= 0 ? "var(--green)" : "var(--red)", marginTop: 6, fontWeight: 800 }}>
        Net Cash Flow · {formatMoney(net, currency)}
      </p>
    </div>
  );
}

export default function ChartsPanel({ transactions, currency = "NGN" }) {
  const data = useMemo(() => getChartData(transactions), [transactions]);

  if (data.length === 0) {
    return (
      <section className="panel chart-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">ANALYTICS</p>
            <h2>Cash Flow</h2>
          </div>
          <span className="count-badge">Last 6 months</span>
        </div>
        <div className="chart-empty">
          <div className="empty-icon">📊</div>
          <h3>No cash flow yet</h3>
          <p>Add income or expenses to see your financial trends over time.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">ANALYTICS</p>
          <h2>Cash Flow — Monthly Trend</h2>
        </div>
        <span className="count-badge">{data.length} months</span>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 10, right: 14, left: 0, bottom: 5 }} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="monthLabel"
              tick={{ fill: "var(--muted)", fontSize: 12, fontWeight: 600 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--muted)", fontSize: 12, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatMoney(value, currency)}
              width={70}
            />
            <Tooltip
              cursor={{ fill: "rgba(42, 76, 212, 0.06)" }}
              content={<CustomTooltip currency={currency} />}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ paddingTop: 14, fontSize: ".82rem", fontWeight: 600, color: "var(--muted)" }}
            />
            <Bar dataKey="income" name="Income" fill="var(--green)" radius={[6, 6, 0, 0]} maxBarSize={28} />
            <Bar dataKey="expenses" name="Expenses" fill="var(--red)" radius={[6, 6, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
