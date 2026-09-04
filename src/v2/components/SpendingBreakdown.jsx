import { useState } from "react";
import { formatMoney } from "../utils/format";

const PALETTE = [
  "#2a4cd4",
  "#0d8a5b",
  "#b87a00",
  "#7a3bd1",
  "#0fb5c9",
  "#d34a4a",
  "#3656b8",
  "#16805a",
  "#9b5a18",
  "#64748b",
];

export default function SpendingBreakdown({ categoryTotals, total, loading }) {
  const [hover, setHover] = useState(null);
  const entries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, v]) => v));

  const SIZE = 200;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const R = 80;
  const STROKE = 22;

  let cumulative = 0;
  const arcs = entries.map(([cat, value], i) => {
    const startAngle = (cumulative / total) * Math.PI * 2 - Math.PI / 2;
    cumulative += value;
    const endAngle = (cumulative / total) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + R * Math.cos(startAngle);
    const y1 = cy + R * Math.sin(startAngle);
    const x2 = cx + R * Math.cos(endAngle);
    const y2 = cy + R * Math.sin(endAngle);
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    const d = `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
    const isDim = hover && hover !== cat;
    return {
      d,
      color: PALETTE[i % PALETTE.length],
      cat,
      value,
      percent: (value / total) * 100,
      dim: isDim,
    };
  });

  return (
    <section className="ft-card ft-breakdown" aria-label="Spending by category">
      <header className="ft-card-head">
        <div>
          <p className="ft-eyebrow">SPENDING</p>
          <h2>Spending by Category</h2>
        </div>
      </header>

      {loading || entries.length === 0 ? (
        <div className="ft-skel skel-chart" />
      ) : (
        <div className="ft-breakdown-body">
          <div className="ft-donut-wrap">
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="ft-donut"
              role="img"
              aria-label="Spending by category donut"
            >
              {arcs.map((a, i) => (
                <path
                  key={a.cat}
                  d={a.d}
                  fill="none"
                  stroke={a.color}
                  strokeWidth={STROKE}
                  strokeLinecap="butt"
                  className={`ft-donut-arc ${a.dim ? "is-dim" : ""}`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                  onMouseEnter={() => setHover(a.cat)}
                  onMouseLeave={() => setHover(null)}
                />
              ))}
              <text x={cx} y={cy - 4} textAnchor="middle" className="ft-donut-label">
                Total
              </text>
              <text x={cx} y={cy + 18} textAnchor="middle" className="ft-donut-value">
                {formatMoney(total, { maximumFractionDigits: 0 })}
              </text>
            </svg>
          </div>

          <ul className="ft-breakdown-list">
            {arcs.map((a, i) => (
              <li
                key={a.cat}
                className={`ft-breakdown-row ${hover === a.cat ? "is-hot" : ""} ${hover && hover !== a.cat ? "is-dim" : ""}`}
                style={{ "--row-index": i }}
                onMouseEnter={() => setHover(a.cat)}
                onMouseLeave={() => setHover(null)}
              >
                <span className="ft-breakdown-swatch" style={{ background: a.color }} />
                <span className="ft-breakdown-name">{a.cat}</span>
                <span className="ft-breakdown-value">
                  {formatMoney(a.value, { maximumFractionDigits: 0 })}
                </span>
                <span className="ft-breakdown-percent">{a.percent.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
