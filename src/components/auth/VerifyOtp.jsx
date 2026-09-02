import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AuthShell from "./AuthShell";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp } = useAuth();

  const initialEmail = location.state?.email || "";
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setInfo("");

    if (!email.trim() || !code.trim()) {
      setError("Please enter your email and the 6-digit code we sent.");
      return;
    }

    setSubmitting(true);
    try {
      await verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
      navigate("/", { replace: true });
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError("Please enter your email to resend the code.");
      return;
    }
    setResending(true);
    setError("");
    setInfo("");
    try {
      await resendOtp({ email: email.trim(), type: "signup" });
      setInfo("A new verification code has been sent to your email.");
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle="Enter the 6-digit code we sent to your inbox to activate your account."
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

        <label>
          Verification code
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
            placeholder="6-digit code"
            autoComplete="one-time-code"
            required
          />
        </label>

        {error && <div className="auth-error" role="alert">{error}</div>}
        {info && <div className="auth-info" role="status">{info}</div>}

        <button className="btn primary auth-submit" type="submit" disabled={submitting || code.length < 4}>
          {submitting ? "Verifying…" : "Verify and continue"}
        </button>

        <button
          type="button"
          className="btn ghost auth-secondary"
          onClick={handleResend}
          disabled={resending}
        >
          {resending ? "Resending…" : "Resend code"}
        </button>
      </form>
    </AuthShell>
  );
}

function humanizeError(err) {
  const message = (err?.message || "").toLowerCase();
  if (message.includes("token") && message.includes("expired")) {
    return "This code has expired. Please request a new one.";
  }
  if (message.includes("invalid") || message.includes("otp")) {
    return "That code didn't match. Please double-check and try again.";
  }
  if (message.includes("rate limit")) {
    return "Too many attempts. Please wait a moment before trying again.";
  }
  return err?.message || "Unable to verify the code. Please try again.";
}
