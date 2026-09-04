export default function FinancialInsights({ insights, loading }) {
  if (loading) {
    return (
      <section className="ft-card ft-insights" aria-label="Financial insights">
        <header className="ft-card-head">
          <div>
            <p className="ft-eyebrow">INSIGHTS</p>
            <h2>Financial Insights</h2>
          </div>
        </header>
        <ul className="ft-insight-grid">
          {[0, 1, 2].map((i) => (
            <li className="ft-skel skel-insight" key={i} />
          ))}
        </ul>
      </section>
    );
  }
  return (
    <section className="ft-card ft-insights" aria-label="Financial insights">
      <header className="ft-card-head">
        <div>
          <p className="ft-eyebrow">INSIGHTS</p>
          <h2>Financial Insights</h2>
        </div>
      </header>
      <ul className="ft-insight-grid">
        {insights.map((it, i) => (
          <li key={it.id} className={`ft-insight tone-${it.tone}`} style={{ "--row-index": i }}>
            <div className="ft-insight-icon" aria-hidden="true">
              {it.icon}
            </div>
            <div>
              <h3>{it.title}</h3>
              <p>{it.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
