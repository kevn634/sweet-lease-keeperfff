import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Building2, ArrowLeft, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Sweet Lease Keeper" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register, loginOwner } = useAuth();
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [err,      setErr]      = useState("");
  const [info,     setInfo]     = useState("");
  const [busy,     setBusy]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (password !== confirm)  { setErr("Passwords do not match."); return; }
    setBusy(true);

    const { error } = await register(email.trim(), password);
    if (error) {
      setErr(error);
      setBusy(false);
      return;
    }

    // Auto-login after registration
    const { error: loginErr } = await loginOwner(email.trim(), password);
    if (!loginErr) {
      navigate({ to: "/app/dashboard" });
    } else {
      setInfo("Account created! Please check your email to verify, then log in.");
    }
    setBusy(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Back to sign in
        </Link>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-[var(--shadow-elevated)]">
          {/* Logo */}
          <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-5">
            <Building2 size={22} />
          </div>

          <h1 className="font-display text-3xl">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Start managing your properties for free.
          </p>

          {info ? (
            <div className="mt-6 p-4 rounded-xl bg-success/15 border border-success/30 text-sm text-success">
              {info}
              <div className="mt-3">
                <Link to="/login" className="font-medium underline">Go to sign in →</Link>
              </div>
            </div>
          ) : (
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
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                  Confirm password
                </label>
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
                />
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
                {busy ? "Creating account…" : "Create account"}
              </button>
            </form>
          )}

          <p className="text-xs text-center text-muted-foreground mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
