import { Link } from "react-router-dom";
import AuthShell from "./AuthShell";

export default function SetupRequired() {
  return (
    <AuthShell
      title="Connect BasseyFlow to Supabase"
      subtitle="Add your Supabase credentials to enable secure multi-user accounts."
    >
      <div className="auth-info" role="status">
        <p><strong>This deployment is missing Supabase environment variables.</strong></p>
        <p>Create a <code>.env</code> file in the project root with:</p>
        <pre className="auth-code">
{`VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
        </pre>
        <p>Then run <code>supabase/schema.sql</code> in the Supabase SQL Editor and restart the dev server.</p>
      </div>
      <div className="auth-form">
        <Link to="/signin" className="btn primary auth-submit">Continue to sign in</Link>
      </div>
    </AuthShell>
  );
}
