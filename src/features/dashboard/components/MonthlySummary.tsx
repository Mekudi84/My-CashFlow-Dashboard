import type { DashboardSummary } from "@/types";
import { formatMoney } from "@/lib/format";

interface MonthlySummaryProps {
  summary: DashboardSummary;
  largestCategory: string | null;
  loading: boolean;
}

type Tone = "income" | "expense" | "savings" | "neutral" | "primary";

interface Item {
  label: string;
  value: string;
  tone: Tone;
}

export default function MonthlySummary({ summary, largestCategory, loading }: MonthlySummaryProps) {
  const savingsRate = summary.monthlyIncomeCents
    ? Math.max(
        0,
        ((summary.monthlyIncomeCents - summary.monthlyExpensesCents) / summary.monthlyIncomeCents) * 100,
      )
    : 0;

  if (loading) {
    return (
      <section className="ft-card ft-summary" aria-label="Monthly summary">
        <header className="ft-card-head">
          <div>
            <p className="ft-eyebrow">SUMMARY</p>
            <h2>Monthly Summary</h2>
          </div>
        </header>
        <div className="ft-skel skel-summary" />
      </section>
    );
  }

  const items: Item[] = [
    {
      label: "Total income",
      value: formatMoney(summary.monthlyIncomeCents, { maximumFractionDigits: 0 }),
      tone: "income",
    },
    {
      label: "Total expenses",
      value: formatMoney(summary.monthlyExpensesCents, { maximumFractionDigits: 0 }),
      tone: "expense",
    },
    {
      label: "Money saved",
      value: formatMoney(
        Math.max(0, summary.monthlyIncomeCents - summary.monthlyExpensesCents),
        { maximumFractionDigits: 0 },
      ),
      tone: "savings",
    },
    { label: "Savings rate", value: `${savingsRate.toFixed(1)}%`, tone: "savings" },
    { label: "Largest category", value: largestCategory ?? "—", tone: "neutral" },
    {
      label: "Total balance",
      value: formatMoney(summary.totalBalanceCents, { maximumFractionDigits: 0 }),
      tone: "primary",
    },
  ];

  return (
    <section className="ft-card ft-summary" aria-label="Monthly summary">
      <header className="ft-card-head">
        <div>
          <p className="ft-eyebrow">SUMMARY</p>
          <h2>Monthly Summary</h2>
        </div>
      </header>
      <ul className="ft-summary-list">
        {items.map((it, i) => (
          <li
            key={it.label}
            className={`ft-summary-item tone-${it.tone}`}
            style={{ ["--row-index" as string]: i }}
          >
            <span>{it.label}</span>
            <strong>{it.value}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}