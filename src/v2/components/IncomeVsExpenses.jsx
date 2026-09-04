import { useEffect, useRef, useState } from "react";
import { formatMoney } from "../utils/format";

export default function IncomeVsExpenses({ income, expenses, loading }) {
  const total = (income || 0) + (expenses || 0);
  const incomePct = total ? (income / total) * 100 : 0;
  const expensePct = total ? (expenses / total) * 100 : 0;
  const net = (income || 0) - (expenses || 0);

  return (
    <section className="ft-card ft-ive" aria-label="Income vs expenses">
      <header className="ft-card-head">
        <div>
          <p className="ft-eyebrow">MONTHLY</p>
          <h2>Income vs Expenses</h2>
        </div>
      </header>

      {loading ? (
        <div className="ft-ive-skel">
          <div className="ft-skel skel-line" />
          <div className="ft-skel skel-line" />
        </div>
      ) : (
        <>
          <div className="ft-ive-row">
            <div className="ft-ive-label">
              <span className="ft-ive-dot income" /> Money In
            </div>
            <div className="ft-ive-value">{formatMoney(income, { maximumFractionDigits: 0 })}</div>
          </div>
          <div className="ft-ive-bar">
            <div className="ft-ive-fill income" style={{ width: `${incomePct}%` }} />
          </div>

          <div className="ft-ive-row" style={{ marginTop: 18 }}>
            <div className="ft-ive-label">
              <span className="ft-ive-dot expense" /> Money Out
            </div>
            <div className="ft-ive-value">
              {formatMoney(expenses, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="ft-ive-bar">
            <div className="ft-ive-fill expense" style={{ width: `${expensePct}%` }} />
          </div>

          <div className="ft-ive-net">
            <span>Net this month</span>
            <strong className={net >= 0 ? "is-up" : "is-down"}>
              {net >= 0 ? "+" : "−"}
              {formatMoney(Math.abs(net), { maximumFractionDigits: 0 })}
            </strong>
          </div>
        </>
      )}
    </section>
  );
}
