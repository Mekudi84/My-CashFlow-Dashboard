import { useEffect, useMemo, useRef, useState } from "react";
import { getCashFlowData } from "../data/mockData";
import { formatMoney } from "../utils/format";

const RANGES = [
  { id: "7D", label: "7D" },
  { id: "30D", label: "30D" },
  { id: "3M", label: "3M" },
  { id: "6M", label: "6M" },
  { id: "1Y", label: "1Y" },
];

const WIDTH = 800;
const HEIGHT = 280;
const PADDING_X = 36;
const PADDING_TOP = 18;
const PADDING_BOTTOM = 30;

export default function CashFlowChart({ range, onRange, loading }) {
  const data = useMemo(() => getCashFlowData(range), [range]);
  const [hover, setHover] = useState(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRendered(true), 30);
    return () => clearTimeout(t);
  }, []);

  const max = Math.max(1, ...data.map((d) => Math.max(d.income, d.expenses)));
  const innerW = WIDTH - PADDING_X * 2;
  const innerH = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const groupW = innerW / Math.max(1, data.length);
  const barW = Math.max(8, Math.min(22, (groupW - 12) / 2));

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => max * (i / yTicks));

  return (
    <section className="ft-card ft-cashflow" aria-label="Cash flow">
      <header className="ft-card-head">
        <div>
          <p className="ft-eyebrow">CASH FLOW</p>
          <h2>Income vs Expenses</h2>
        </div>
        <div className="ft-tabs" role="tablist">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={range === r.id}
              className={`ft-tab ${range === r.id ? "is-active" : ""}`}
              onClick={() => onRange(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      <div className="ft-chart-wrap">
        {loading ? (
          <div className="ft-skel skel-chart" />
        ) : (
          <svg
            className={`ft-chart ${rendered ? "is-in" : ""}`}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={`Cash flow for ${range}`}
          >
            {ticks.map((v, i) => {
              const y = PADDING_TOP + innerH - (v / max) * innerH;
              return (
                <g key={i}>
                  <line x1={PADDING_X} x2={WIDTH - PADDING_X} y1={y} y2={y} className="ft-chart-grid" />
                  <text x={PADDING_X - 8} y={y + 3} className="ft-chart-axis">{formatMoney(v, { maximumFractionDigits: 0 })}</text>
                </g>
              );
            })}
            {data.map((d, i) => {
              const cx = PADDING_X + groupW * i + groupW / 2;
              const iH = (d.income / max) * innerH;
              const eH = (d.expenses / max) * innerH;
              const ix = cx - barW - 3;
              const ex = cx + 3;
              const delay = `${i * 30}ms`;
              return (
                <g
                  key={d.label + i}
                  onMouseEnter={() => setHover({ ...d, x: cx, y: PADDING_TOP + Math.min(iH, eH) })}
                  onMouseLeave={() => setHover(null)}
                  className="ft-chart-group"
                >
                  <rect
                    x={ix}
                    y={PADDING_TOP + innerH - iH}
                    width={barW}
                    height={iH}
                    rx={3}
                    className="ft-bar ft-bar-income"
                    style={{ transitionDelay: delay }}
                  />
                  <rect
                    x={ex}
                    y={PADDING_TOP + innerH - eH}
                    width={barW}
                    height={eH}
                    rx={3}
                    className="ft-bar ft-bar-expense"
                    style={{ transitionDelay: delay }}
                  />
                  <text x={cx} y={HEIGHT - 10} textAnchor="middle" className="ft-chart-label">{d.label}</text>
                </g>
              );
            })}
            {hover && (
              <g className="ft-tooltip" style={{ pointerEvents: "none" }}>
                <rect
                  x={Math.min(WIDTH - 168, Math.max(8, hover.x - 78))}
                  y={Math.max(8, hover.y - 78)}
                  width={160}
                  height={70}
                  rx={10}
                  className="ft-tooltip-bg"
                />
                <text
                  x={Math.min(WIDTH - 160, Math.max(16, hover.x - 70))}
                  y={Math.max(28, hover.y - 58)}
                  className="ft-tooltip-label"
                >
                  {hover.label}
                </text>
                <text
                  x={Math.min(WIDTH - 160, Math.max(16, hover.x - 70))}
                  y={Math.max(46, hover.y - 40)}
                  className="ft-tooltip-line ft-tooltip-income"
                >
                  Income {formatMoney(hover.income, { maximumFractionDigits: 0 })}
                </text>
                <text
                  x={Math.min(WIDTH - 160, Math.max(16, hover.x - 70))}
                  y={Math.max(62, hover.y - 26)}
                  className="ft-tooltip-line ft-tooltip-expense"
                >
                  Expenses {formatMoney(hover.expenses, { maximumFractionDigits: 0 })}
                </text>
                <text
                  x={Math.min(WIDTH - 160, Math.max(16, hover.x - 70))}
                  y={Math.max(78, hover.y - 12)}
                  className="ft-tooltip-line ft-tooltip-net"
                >
                  Net {formatMoney(hover.income - hover.expenses, { maximumFractionDigits: 0 })}
                </text>
              </g>
            )}
          </svg>
        )}
      </div>

      <div className="ft-legend" role="list">
        <div className="ft-legend-item" role="listitem">
          <span className="ft-swatch income" /> Income
        </div>
        <div className="ft-legend-item" role="listitem">
          <span className="ft-swatch expense" /> Expenses
        </div>
        <div className="ft-legend-item" role="listitem">
          <span className="ft-swatch net" /> Net cash flow
        </div>
      </div>
    </section>
  );
}
