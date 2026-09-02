export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth-shell">
      <div className="auth-card" role="region" aria-labelledby="auth-title">
        <div className="auth-brand">
          <img src="/basseyflow-logo.svg" alt="BasseyFlow" className="auth-logo" />
        </div>
        <div className="auth-header">
          <h1 id="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>
        <div className="auth-body">{children}</div>
        {footer && <div className="auth-footer">{footer}</div>}
      </div>
      <p className="auth-meta">BasseyFlow · Financial clarity. Smarter cash flow.</p>
    </div>
  );
}
