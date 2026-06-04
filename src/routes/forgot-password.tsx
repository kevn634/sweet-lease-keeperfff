import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Sweet Lease Keeper" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent,  setSent]  = useState(false);
  const [err,   setErr]   = useState("");
  const [busy,  setBusy]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const { error } = await forgotPassword(email.trim());
    if (error) {
      setErr(error);
    } else {
      setSent(true);
    }
    setBusy(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
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
          <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-5">
            <Mail size={22} />
          </div>

          {sent ? (
            <>
              <div className="flex items-center gap-2 text-success mb-3">
                <CheckCircle2 size={20} />
                <h1 className="font-display text-2xl">Check your inbox</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to{" "}
                <strong className="text-foreground">{email}</strong>. Click the
                link in the email to set a new password.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-block px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl">Forgot password?</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                  {busy ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
