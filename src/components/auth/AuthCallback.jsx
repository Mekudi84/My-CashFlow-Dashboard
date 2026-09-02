import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { supabase } = useAuth();
  const [message, setMessage] = useState("Completing sign in…");

  useEffect(() => {
    let cancelled = false;
    async function complete() {
      if (!supabase) {
        navigate("/signin", { replace: true });
        return;
      }
      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (error) {
          setMessage(error.message);
          return;
        }
      }
      navigate("/", { replace: true });
    }
    complete();
    return () => {
      cancelled = true;
    };
  }, [supabase, params, navigate]);

  return (
    <div className="auth-shell">
      <div className="auth-card" role="status" aria-live="polite">
        <p>{message}</p>
      </div>
    </div>
  );
}
