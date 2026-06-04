import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useStore, isPaid, currency, MONTHS } from "@/lib/store";
import { UserRound, ArrowLeft, CheckCircle2, AlertCircle, LogOut, KeyRound, Hammer, Plus } from "lucide-react";

export const Route = createFileRoute("/tenant")({
  head: () => ({ meta: [{ title: "Tenant portal — Rithany Illam" }] }),
  component: TenantPage,
});

function TenantPage() {
  const { session, loginTenant, logout } = useAuth();
  const { data, addIssue } = useStore();
  const navigate = useNavigate();
  const [secretCode, setSecretCode] = useState("");
  const [err, setErr] = useState("");

  // Issue reporting form state
  const [isReporting, setIsReporting] = useState(false);
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");

  if (session?.role === "tenant") {
    const tenant = data.tenants.find((t) => t.id === session.tenantId);
    if (!tenant) {
      logout();
      return null;
    }
    const house = data.houses.find((h) => h.id === tenant.house_id);
    const history = data.payments
      .filter((p) => p.tenant_id === tenant.id)
      .sort((a, b) => (b.year - a.year) * 100 + (b.month - a.month));
    const now = new Date();
    const currentPaid = isPaid(data.payments, tenant.id, now.getMonth() + 1, now.getFullYear());
    
    const tenantIssues = data.issues
      .filter((i) => i.tenant_id === tenant.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const handleReportIssue = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!issueTitle.trim() || !issueDescription.trim() || !house) return;
      await addIssue(tenant.id, house.id, issueTitle.trim(), issueDescription.trim());
      setIsReporting(false);
      setIssueTitle("");
      setIssueDescription("");
    };

    return (
      <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-3xl mx-auto p-6 md:p-10 pb-20">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="text-sm text-muted-foreground inline-flex items-center gap-1">
              <ArrowLeft size={14} /> Home
            </Link>
            <button
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>

          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Welcome back</p>
          <h1 className="font-display text-4xl mt-2">{tenant.name}</h1>
          <p className="text-muted-foreground mt-1">
            {house?.number} · {data.apartmentName}
          </p>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-soft)]">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Monthly rent</p>
              <p className="font-display text-3xl mt-2">{currency(tenant.monthly_rent)}</p>
            </div>
            <div
              className={`rounded-2xl p-6 border shadow-[var(--shadow-soft)] ${
                currentPaid
                  ? "bg-success/15 border-success/40"
                  : "bg-warning/15 border-warning/40"
              }`}
            >
              <p className="text-xs uppercase tracking-wider opacity-70">{MONTHS[now.getMonth()]} {now.getFullYear()}</p>
              <div className="flex items-center gap-2 mt-2">
                {currentPaid ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
                <p className="font-display text-2xl">{currentPaid ? "Paid" : "Pending"}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Reported Issues</h2>
            <button onClick={() => setIsReporting(!isReporting)} className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg shadow-[var(--shadow-soft)] hover:opacity-90 inline-flex items-center gap-1.5">
              <Plus size={14} /> Report Issue
            </button>
          </div>
          
          {isReporting && (
            <form onSubmit={handleReportIssue} className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-soft)] mb-6 space-y-4">
              <h3 className="font-display text-lg">Report Maintenance Issue</h3>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Issue Title</label>
                <input required value={issueTitle} onChange={e => setIssueTitle(e.target.value)} placeholder="e.g. Leaking tap in kitchen" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Description</label>
                <textarea required value={issueDescription} onChange={e => setIssueDescription(e.target.value)} placeholder="Please provide details..." rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary resize-none" />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setIsReporting(false)} className="px-4 py-2 text-sm border border-border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg">Submit Report</button>
              </div>
            </form>
          )}

          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden shadow-[var(--shadow-soft)]">
            {tenantIssues.length === 0 && (
              <p className="p-6 text-sm text-muted-foreground">You have no reported maintenance issues.</p>
            )}
            {tenantIssues.map((issue) => (
              <div key={issue.id} className="p-4 flex items-start gap-4">
                <div className={`mt-0.5 ${issue.status === "open" ? "text-warning" : "text-success"}`}>
                  {issue.status === "open" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                </div>
                <div>
                  <p className="font-medium">{issue.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                  <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-2">
                    <span className="uppercase tracking-wider font-semibold">{issue.status}</span>
                    <span>·</span>
                    <span>Reported {new Date(issue.created_at).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="font-display text-xl mt-12 mb-4">Payment history</h2>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden shadow-[var(--shadow-soft)]">
            {history.length === 0 && (
              <p className="p-6 text-sm text-muted-foreground">No payments recorded yet.</p>
            )}
            {history.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{MONTHS[p.month - 1]} {p.year}</p>
                  <p className="text-xs text-muted-foreground">Paid on {p.paid_on}</p>
                </div>
                <p className="font-display text-lg">{currency(p.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--gradient-hero)" }}>
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="bg-card border border-border rounded-2xl p-8 shadow-[var(--shadow-elevated)]">
          <div className="p-3 rounded-xl bg-accent/30 w-fit mb-4">
            <KeyRound size={20} className="text-accent-foreground" />
          </div>
          <h1 className="font-display text-3xl">Tenant portal</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your secret login code.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const t = data.tenants.find((x) => x.secret_code === secretCode.trim().toUpperCase());
              if (t) {
                loginTenant(t.id);
                setErr("");
              } else {
                setErr("Invalid login code.");
              }
            }}
            className="mt-6 space-y-3"
          >
            <input
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              placeholder="e.g. H1-ABCD"
              autoFocus
              className="w-full px-4 py-3 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring uppercase"
            />
            {err && <p className="text-sm text-destructive">{err}</p>}
            <button
              type="submit"
              className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 shadow-[var(--shadow-soft)] transition-opacity"
            >
              Sign In
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-4 text-center">Ask your owner if you don't know your code.</p>
        </div>
      </div>
    </div>
  );
}