import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AuthShell from "./AuthShell";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setInfo("");

    if (!email.trim()) {
      setError("Please enter the email associated with your account.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({ email: email.trim() });
      setInfo("If an account exists for that email, a secure password reset link has been sent.");
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a secure link to choose a new password."
      footer={<><Link to="/signin">Back to sign in</Link></>}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        {error && <div className="auth-error" role="alert">{error}</div>}
        {info && <div className="auth-info" role="status">{info}</div>}

        <button className="btn primary auth-submit" type="submit" disabled={submitting}>
          {submitting ? "Sending link…" : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}

function humanizeError(err) {
  const message = (err?.message || "").toLowerCase();
  if (message.includes("rate limit")) {
    return "Too many requests. Please wait a moment and try again.";
  }
  return err?.message || "Unable to send a reset link right now. Please try again.";
}
