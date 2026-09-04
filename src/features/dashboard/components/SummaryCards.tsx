import Icon from "./Icon";
import { useCountUp } from "../hooks/useCountUp";
import { formatMoney } from "@/lib/format";

type CardId = "balance" | "income" | "expense" | "savings";
type CardTone = "primary" | "positive" | "negative" | "savings";

interface CardDef {
  id: CardId;
  field: "totalBalance" | "monthlyIncome" | "monthlyExpenses" | "totalSavings";
  deltaKey: "balance" | "income" | "expenses" | "savings";
  label: string;
  icon: string;
  tone: CardTone;
}

const CARDS: CardDef[] = [
  { id: "balance", field: "totalBalance", deltaKey: "balance", label: "Total Balance", icon: "wallet", tone: "primary" },
  { id: "income", field: "monthlyIncome", deltaKey: "income", label: "Monthly Income", icon: "trendingUp", tone: "positive" },
  { id: "expense", field: "monthlyExpenses", deltaKey: "expenses", label: "Monthly Expenses", icon: "trendingDown", tone: "negative" },
  { id: "savings", field: "totalSavings", deltaKey: "savings", label: "Total Savings", icon: "piggy", tone: "savings" },
];

export interface SummaryShape {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalSavings: number;
  delta: Record<CardDef["deltaKey"], number>;
}

interface SummaryCardsProps {
  summary: SummaryShape;
  loading: boolean;
}

export default function SummaryCards({ summary, loading }: SummaryCardsProps) {
  return (
    <section className="ft-summary-grid" aria-label="Financial summary">
      {CARDS.map((card, i) => (
        <SummaryCard key={card.id} card={card} summary={summary} loading={loading} index={i} />
      ))}
    </section>
  );
}

interface SummaryCardProps {
  card: CardDef;
  summary: SummaryShape;
  loading: boolean;
  index: number;
}

function SummaryCard({ card, summary, loading, index }: SummaryCardProps) {
  const value = summary[card.field];
  const delta = summary.delta[card.deltaKey];
  const animated = useCountUp(loading ? 0 : value, 950);

  const isUp = delta >= 0;
  const deltaText = `${isUp ? "+" : ""}${delta.toFixed(1)}%`;

  return (
    <article
      className={`ft-summary-card tone-${card.tone}`}
      style={{ ["--card-index" as string]: index }}
    >
      <div className="ft-summary-top">
        <span className="ft-card-label">{card.label}</span>
        <span className="ft-card-icon">
          <Icon name={card.icon} size={16} />
        </span>
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
            <small>from last month</small>
          </>
        )}
      </div>
    </article>
  );
}