import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { CURRENCY_LIST, type CurrencyCode } from "@/types/currency";

export default function RegisterPage(): React.ReactElement {
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>("USD");
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") {
    const from = (location.state as { from?: string } | null)?.from ?? "/v2/overview";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register({ email, name, password, preferredCurrency });
      const from = (location.state as { from?: string } | null)?.from ?? "/v2/overview";
      navigate(from, { replace: true });
    } catch {
      // error is in store
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <header className="auth-card-head">
          <h1>Create account</h1>
          <p>Track your money across every account.</p>
        </header>
        <form onSubmit={handleSubmit} noValidate>
          <label>
            Name
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <small className="auth-hint">Minimum 8 characters.</small>
          </label>
          <label>
            Preferred currency
            <select
              value={preferredCurrency}
              onChange={(e) => setPreferredCurrency(e.target.value as CurrencyCode)}
            >
              {CURRENCY_LIST.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.label}
                </option>
              ))}
            </select>
          </label>
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}
          <button type="submit" className="ft-btn ft-btn-primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create account"}
          </button>
        </form>
        <footer className="auth-card-foot">
          <span>Already have an account?</span>
          <Link to="/login">Sign in</Link>
        </footer>
      </div>
    </main>
  );
}