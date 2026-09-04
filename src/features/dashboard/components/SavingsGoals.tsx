import type { SavingsGoal } from "@/types";
import { formatMoney, formatDate } from "@/lib/format";

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  loading: boolean;
}

function CircularProgress({ value }: { value: number }) {
  const R = 28;
  const C = 2 * Math.PI * R;
  const offset = C - (value / 100) * C;
  return (
    <svg className="ft-circ" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r={R} className="ft-circ-track" />
      <circle
        cx="32"
        cy="32"
        r={R}
        className="ft-circ-bar"
        style={{ strokeDasharray: C, strokeDashoffset: offset }}
      />
      <text x="32" y="36" textAnchor="middle" className="ft-circ-text">
        {Math.round(value)}%
      </text>
    </svg>
  );
}

export default function SavingsGoals({ goals, loading }: SavingsGoalsProps) {
  return (
    <section className="ft-card ft-goals" aria-label="Savings goals">
      <header className="ft-card-head">
        <div>
          <p className="ft-eyebrow">GOALS</p>
          <h2>Savings Goals</h2>
        </div>
        <span className="ft-pill">{goals.length} active</span>
      </header>

      {loading ? (
        <div className="ft-goal-grid">
          {[0, 1, 2].map((i) => (
            <div className="ft-skel skel-goal" key={i} />
          ))}
        </div>
      ) : (
        <ul className="ft-goal-grid">
          {goals.map((g, i) => {
            const pct = Math.min(100, (g.currentCents / Math.max(1, g.targetCents)) * 100);
            const complete = pct >= 100;
            return (
              <li
                key={g.id}
                className={`ft-goal ${complete ? "is-complete" : ""}`}
                style={{ ["--row-index" as string]: i }}
              >
                <div className="ft-goal-top">
                  <div className="ft-goal-name">{g.name}</div>
                  <CircularProgress value={pct} />
                </div>
                <div className="ft-goal-progress">
                  <div
                    className="ft-goal-fill"
                    style={{ width: `${pct}%`, transitionDelay: `${i * 80}ms` }}
                  />
                </div>
                <div className="ft-goal-meta">
                  <div>
                    <strong>{formatMoney(g.currentCents, { maximumFractionDigits: 0 })}</strong>
                    <span> / {formatMoney(g.targetCents, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="ft-goal-target">
                    {complete ? (
                      <span className="ft-goal-tag is-complete">Goal reached</span>
                    ) : (
                      <>Target {g.targetDate ? formatDate(g.targetDate) : "—"}</>
                    )}
                  </div>
                </div>
                <div className="ft-goal-remaining">
                  {complete
                    ? `${formatMoney(g.currentCents - g.targetCents, { maximumFractionDigits: 0 })} over target`
                    : `${formatMoney(g.targetCents - g.currentCents, { maximumFractionDigits: 0 })} remaining`}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}