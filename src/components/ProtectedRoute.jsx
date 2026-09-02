import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading, isSupabaseConfigured } = useAuth();
  const location = useLocation();

  if (!isSupabaseConfigured) {
    return <Navigate to="/setup" replace state={{ from: location }} />;
  }

  if (loading) {
    return (
      <div className="auth-loading" role="status" aria-live="polite">
        <div className="auth-spinner" aria-hidden="true" />
        <p>Restoring your secure session…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (user && !user.email_confirmed_at) {
    return <Navigate to="/verify" replace state={{ email: user.email, from: location }} />;
  }

  return children;
}
