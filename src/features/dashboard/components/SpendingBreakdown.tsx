import { useState } from "react";
import type { CategoryTotal } from "@/types";
import { formatMoney } from "@/lib/format";

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

interface SpendingBreakdownProps {
  categories: CategoryTotal[];
  loading: boolean;
}

interface Arc {
  d: string;
  color: string;
  categoryId: string;
  categoryName: string;
  totalCents: number;
  percent: number;
  dim: boolean;
}

export default function SpendingBreakdown({ categories, loading }: SpendingBreakdownProps) {
  const [hover, setHover] = useState<string | null>(null);
  const totalCents = categories.reduce((s, c) => s + c.totalCents, 0);

  const SIZE = 200;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const R = 80;
  const STROKE = 22;

  let cumulative = 0;
  const arcs: Arc[] = categories.map((c, i) => {
    const startAngle = (cumulative / totalCents) * Math.PI * 2 - Math.PI / 2;
    cumulative += c.totalCents;
    const endAngle = (cumulative / totalCents) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + R * Math.cos(startAngle);
    const y1 = cy + R * Math.sin(startAngle);
    const x2 = cx + R * Math.cos(endAngle);
    const y2 = cy + R * Math.sin(endAngle);
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    const d = `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
    return {
      d,
      color: c.color || (PALETTE[i % PALETTE.length] ?? "#64748b"),
      categoryId: c.categoryId,
      categoryName: c.categoryName,
      totalCents: c.totalCents,
      percent: (c.totalCents / totalCents) * 100,
      dim: hover !== null && hover !== c.categoryId,
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

      {loading || arcs.length === 0 ? (
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
                  key={a.categoryId}
                  d={a.d}
                  fill="none"
                  stroke={a.color}
                  strokeWidth={STROKE}
                  strokeLinecap="butt"
                  className={`ft-donut-arc ${a.dim ? "is-dim" : ""}`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                  onMouseEnter={() => setHover(a.categoryId)}
                  onMouseLeave={() => setHover(null)}
                />
              ))}
              <text x={cx} y={cy - 4} textAnchor="middle" className="ft-donut-label">
                Total
              </text>
              <text x={cx} y={cy + 18} textAnchor="middle" className="ft-donut-value">
                {formatMoney(totalCents, { maximumFractionDigits: 0 })}
              </text>
            </svg>
          </div>

          <ul className="ft-breakdown-list">
            {arcs.map((a, i) => (
              <li
                key={a.categoryId}
                className={`ft-breakdown-row ${hover === a.categoryId ? "is-hot" : ""} ${hover && hover !== a.categoryId ? "is-dim" : ""}`}
                style={{ ["--row-index" as string]: i }}
                onMouseEnter={() => setHover(a.categoryId)}
                onMouseLeave={() => setHover(null)}
              >
                <span className="ft-breakdown-swatch" style={{ background: a.color }} />
                <span className="ft-breakdown-name">{a.categoryName}</span>
                <span className="ft-breakdown-value">
                  {formatMoney(a.totalCents, { maximumFractionDigits: 0 })}
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