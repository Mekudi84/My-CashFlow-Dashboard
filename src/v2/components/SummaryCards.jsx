import Icon from "./Icon";
import useCountUp from "../hooks/useCountUp";
import { formatMoney } from "../utils/format";

const CARDS = [
  { id: "balance", label: "Total Balance", icon: "wallet", tone: "primary" },
  { id: "income", label: "Monthly Income", icon: "trendingUp", tone: "positive" },
  { id: "expense", label: "Monthly Expenses", icon: "trendingDown", tone: "negative" },
  { id: "savings", label: "Total Savings", icon: "piggy", tone: "savings" },
];

export default function SummaryCards({ summary, loading }) {
  return (
    <section className="ft-summary-grid" aria-label="Financial summary">
      {CARDS.map((card, i) => (
        <SummaryCard key={card.id} card={card} summary={summary} loading={loading} index={i} />
      ))}
    </section>
  );
}

function SummaryCard({ card, summary, loading, index }) {
  const value = summary[card.id];
  const delta = summary.delta?.[card.id];
  const animated = useCountUp(loading ? 0 : value, 950);

  const isUp = (delta ?? 0) >= 0;
  const deltaText = `${isUp ? "+" : ""}${(delta ?? 0).toFixed(1)}%`;
  const deltaSuffix = "from last month";

  return (
    <article
      className={`ft-summary-card tone-${card.tone}`}
      style={{ "--card-index": index }}
    >
      <div className="ft-summary-top">
        <span className="ft-card-label">{card.label}</span>
        <span className="ft-card-icon"><Icon name={card.icon} size={16} /></span>
      </div>
      <div className="ft-summary-value">
        {loading ? (
          <div className="ft-skel skel-value" />
        ) : (
          <strong>{formatMoney(animated, { maximumFractionDigits: 0 })}</strong>
        )}
      </div>
      <div className="ft-summary-foot">
        {loading ? (
          <>
            <div className="ft-skel skel-pill" />
            <div className="ft-skel skel-line" />
          </>
        ) : (
          <>
            <span className={`ft-trend ${isUp ? "is-up" : "is-down"}`}>
              <Icon name={isUp ? "arrowUp" : "arrowDown"} size={12} />
              {deltaText}
            </span>
            <small>{deltaSuffix}</small>
          </>
        )}
      </div>
    </article>
  );
}
