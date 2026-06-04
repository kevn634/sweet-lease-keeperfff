import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Building2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Sweet Lease Keeper" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { loginOwner, ownerUser } = useAuth();
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [err,      setErr]      = useState("");
  const [busy,     setBusy]     = useState(false);

  // If already logged in, go to dashboard
  useEffect(() => {
    if (ownerUser) navigate({ to: "/app/dashboard", replace: true });
  }, [ownerUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const { error } = await loginOwner(email.trim(), password);
    if (error) {
      setErr(error);
      setBusy(false);
    } else {
      navigate({ to: "/app/dashboard" });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-[var(--shadow-elevated)]">
            <Building2 size={26} />
          </div>
          <h1 className="font-display text-3xl">Sweet Lease Keeper</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your properties with ease</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-[var(--shadow-elevated)]">
          <h2 className="font-display text-2xl mb-1">Welcome back</h2>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {err && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 shadow-[var(--shadow-soft)] transition-opacity text-sm"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-5">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Create one free
            </Link>
          </p>
        </div>

        <p className="text-center mt-6 text-xs text-muted-foreground">
          Are you a tenant?{" "}
          <Link to="/tenant" className="text-primary hover:underline">
            Go to Tenant Portal →
          </Link>
        </p>
      </div>
    </div>
  );
}