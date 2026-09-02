import { useMemo } from "react";
import { formatMoney } from "../utils/currency";
import AnimatedNumber from "./AnimatedNumber";
import Sparkline from "./Sparkline";

function buildSparkline(transactions, type) {
  const monthly = {};
  transactions.forEach(({ date, amount, type: t }) => {
    if (t !== type) return;
    const d = new Date(`${date}T00:00:00`);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthly[key] = (monthly[key] || 0) + Number(amount);
  });
  const sorted = Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0]));
  const values = sorted.map(([, v]) => v);
  if (values.length < 2) {
    return values.length === 0 ? [0, 0] : [0, values[0]];
  }
  return values.slice(-8);
}

function buildBalanceSparkline(transactions) {
  const monthly = {};
  transactions.forEach(({ date, amount, type }) => {
    const d = new Date(`${date}T00:00:00`);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthly[key] = (monthly[key] || 0) + (type === "income" ? Number(amount) : -Number(amount));
  });
  const sorted = Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0]));
  let running = 0;
  const points = sorted.map(([, v]) => (running += v));
  if (points.length === 0) return [0, 0];
  if (points.length === 1) return [0, points[0]];
  return points.slice(-8);
}

export default function SummaryCards({ summary, currency, onCardAction, transactions = [] }) {
  const { balance, income, expenses, savingsRate } = summary;

  const balanceSpark = useMemo(() => buildBalanceSparkline(transactions), [transactions]);
  const incomeSpark = useMemo(() => buildSparkline(transactions, "income"), [transactions]);
  const expenseSpark = useMemo(() => buildSparkline(transactions, "expense"), [transactions]);

  const isPositive = balance >= 0;

  return (
    <section className="summary-grid" aria-label="Financial summary">
      <article
        className="summary-card primary-balance"
        onClick={() => onCardAction?.("balance")}
        role={onCardAction ? "button" : undefined}
        tabIndex={onCardAction ? 0 : undefined}
        onKeyDown={(event) => {
          if (!onCardAction) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onCardAction("balance");
          }
        }}
      >
        <div className="card-top">
          <span className="card-label">Total Balance</span>
          <span className={`trend-pill ${isPositive ? "up" : "down"}`}>
            <span aria-hidden="true">{isPositive ? "↑" : "↓"}</span>
            {Math.abs(savingsRate).toFixed(1)}%
          </span>
        </div>
        <strong className="primary-value">
          <AnimatedNumber value={balance} format={(v) => formatMoney(v, currency)} />
        </strong>
        <div className="card-foot">
          <small>Net position · all recorded activity</small>
          <Sparkline points={balanceSpark} color="currentColor" width={140} height={38} />
        </div>
      </article>

      <article
        className="summary-card income"
        onClick={() => onCardAction?.("income")}
        role={onCardAction ? "button" : undefined}
        tabIndex={onCardAction ? 0 : undefined}
        onKeyDown={(event) => {
          if (!onCardAction) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onCardAction("income");
          }
        }}
      >
        <div className="card-top">
          <span className="card-label">Total Income</span>
          <div className="card-icon" aria-hidden="true">↗</div>
        </div>
        <strong>
          <AnimatedNumber value={income} format={(v) => formatMoney(v, currency)} />
        </strong>
        <div className="card-foot">
          <small>All recorded income</small>
          <Sparkline points={incomeSpark} color="currentColor" width={90} height={28} />
        </div>
      </article>

      <article
        className="summary-card expense"
        onClick={() => onCardAction?.("expense")}
        role={onCardAction ? "button" : undefined}
        tabIndex={onCardAction ? 0 : undefined}
        onKeyDown={(event) => {
          if (!onCardAction) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onCardAction("expense");
          }
        }}
      >
        <div className="card-top">
          <span className="card-label">Total Expenses</span>
          <div className="card-icon" aria-hidden="true">↘</div>
        </div>
        <strong>
          <AnimatedNumber value={expenses} format={(v) => formatMoney(v, currency)} />
        </strong>
        <div className="card-foot">
          <small>All recorded spending</small>
          <Sparkline points={expenseSpark} color="currentColor" width={90} height={28} />
        </div>
      </article>

      <article className="summary-card savings">
        <div className="card-top">
          <span className="card-label">Savings Rate</span>
          <div className="card-icon" aria-hidden="true">◉</div>
        </div>
        <strong>{Math.max(savingsRate, 0).toFixed(1)}%</strong>
        <div className="card-foot">
          <small>{income ? `${formatMoney(Math.max(balance, 0), currency)} currently saved` : "No income recorded yet"}</small>
        </div>
      </article>
    </section>
  );
}
