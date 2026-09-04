import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps): React.ReactElement {
  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const location = useLocation();

  useEffect(() => {
    if (status === "unknown") void bootstrap();
  }, [status, bootstrap]);

  if (status === "unknown" || status === "loading") {
    return (
      <div className="auth-loading" role="status" aria-live="polite">
        <span className="auth-loading-dot" aria-hidden="true" />
        Loading…
      </div>
    );
  }
  if (status !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}