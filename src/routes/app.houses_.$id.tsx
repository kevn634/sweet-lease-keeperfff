import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore, currency, isPaid, MONTHS, uid } from "@/lib/store";
import { useState } from "react";
import { ArrowLeft, Phone, Calendar, CheckCircle2, AlertCircle, Trash2, MessageCircle, BellRing, Receipt, KeyRound, Hammer } from "lucide-react";

export const Route = createFileRoute("/app/houses_/$id")({
  component: HouseDetail,
});

function HouseDetail() {
  const { id } = Route.useParams();
  const { data, saveTenant: storeSaveTenant, removeTenant: storeRemoveTenant, deleteHouse: storeDeleteHouse, togglePaid, deletePayment, resolveIssue } = useStore();
  const navigate = useNavigate();
  const house = data.houses.find((h) => h.id === id);
  const tenant = data.tenants.find((t) => t.house_id === id);
  const [editing, setEditing] = useState(!tenant);
  const [form, setForm] = useState({
    name: tenant?.name ?? "",
    phone: tenant?.phone ?? "",
    monthly_rent: tenant?.monthly_rent ?? 8000,
    advance: tenant?.advance ?? 0,
    photo: tenant?.photo ?? "",
    old_address: tenant?.old_address ?? "",
    aadhar_card: tenant?.aadhar_card ?? "",
  });

  if (!house) {
    return (
      <div>
        <p>House not found.</p>
        <Link to="/app/houses" className="text-primary">Back</Link>
      </div>
    );
  }

  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  const paid = tenant ? isPaid(data.payments, tenant.id, m, y) : false;

  const history = tenant
    ? data.payments
        .filter((p) => p.tenant_id === tenant.id)
        .sort((a, b) => (b.year - a.year) * 100 + (b.month - a.month))
    : [];
    
  const tenantIssues = tenant
    ? data.issues
        .filter(i => i.tenant_id === tenant.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : [];

  const totalCollected = history.reduce((s, p) => s + p.amount, 0);
  const phoneDigits = tenant?.phone.replace(/\D/g, "") ?? "";
  const reminderMsg = tenant
    ? encodeURIComponent(
        `Hi ${tenant.name}, gentle reminder for your ${MONTHS[m - 1]} ${y} rent of ₹${tenant.monthly_rent.toLocaleString("en-IN")} for ${house.number} at ${data.apartmentName}. Thank you!`,
      )
    : "";
  const receiptMsg = tenant
    ? encodeURIComponent(
        `Hi ${tenant.name}, we have received your ${MONTHS[m - 1]} ${y} rent of ₹${tenant.monthly_rent.toLocaleString("en-IN")} for ${house.number}. Thank you! — ${data.apartmentName}`,
      )
    : "";

  const saveTenant = async () => {
    if (tenant) {
      await storeSaveTenant({ id: tenant.id, ...form });
    } else {
      // Auto-generate secret code on creation
      const secret_code = `${house.number.replace(/\s+/g, '')}-${uid().slice(0, 4)}`.toUpperCase();
      await storeSaveTenant({ house_id: house.id, secret_code, ...form });
    }
    setEditing(false);
  };

  const removeTenant = async () => {
    if (!tenant) return;
    if (!confirm("Remove tenant and mark house vacant?")) return;
    await storeRemoveTenant(tenant.id);
    navigate({ to: "/app/houses" });
  };

  const deleteHouse = async () => {
    if (!confirm("Are you sure you want to delete this house completely?")) return;
    await storeDeleteHouse(house.id);
    navigate({ to: "/app/houses" });
  };

  const markPaid = async () => {
    if (!tenant) return;
    await togglePaid(tenant.id, tenant.monthly_rent, m, y);
  };

  return (
    <div className="space-y-8">
      <Link to="/app/houses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> All houses
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{data.apartmentName}</p>
          <h1 className="font-display text-4xl mt-2">{house.number}</h1>
        </div>
        <div className="flex gap-2 items-center">
          <span className={`text-xs uppercase tracking-wider px-3 py-1.5 rounded-full ${
            house.status === "occupied" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}>{house.status}</span>
          <button onClick={deleteHouse} className="px-3 py-1.5 rounded-lg border border-border text-sm text-destructive inline-flex items-center gap-1 hover:bg-destructive/10">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-soft)]">
        {editing ? (
          <div className="space-y-4">
            <h2 className="font-display text-xl">{tenant ? "Edit tenant" : "Add tenant"}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Name">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
              </Field>
              <Field label="Phone">
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
              </Field>
              <Field label="Monthly rent (₹)">
                <input type="number" value={form.monthly_rent} onChange={(e) => setForm({ ...form, monthly_rent: Number(e.target.value) })} className="input" />
              </Field>
              <Field label="Photo URL">
                <input value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} className="input" placeholder="https://..." />
              </Field>
              <Field label="Old Address">
                <input value={form.old_address} onChange={(e) => setForm({ ...form, old_address: e.target.value })} className="input" />
              </Field>
              <Field label="Aadhar Card Number">
                <input value={form.aadhar_card} onChange={(e) => setForm({ ...form, aadhar_card: e.target.value })} className="input" />
              </Field>
              <Field label="Advance paid (₹)">
                <input type="number" min={0} value={form.advance} onChange={(e) => setForm({ ...form, advance: Number(e.target.value) })} className="input" />
              </Field>
            </div>
            <div className="flex gap-2">
              <button onClick={saveTenant} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Save</button>
              {tenant && (
                <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg border border-border text-sm">Cancel</button>
              )}
            </div>
          </div>
        ) : tenant ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-display text-2xl">{tenant.name}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                  <span className="inline-flex items-center gap-1"><Phone size={13} /> {tenant.phone}</span>
                  <span>Moved in {tenant.moved_in}</span>
                </div>
                {(tenant.old_address || tenant.aadhar_card || tenant.photo || tenant.secret_code) && (
                  <div className="mt-3 text-sm text-muted-foreground space-y-1">
                    {tenant.photo && <p><strong>Photo:</strong> <a href={tenant.photo} target="_blank" rel="noreferrer" className="text-primary hover:underline">View</a></p>}
                    {tenant.aadhar_card && <p><strong>Aadhar:</strong> {tenant.aadhar_card}</p>}
                    {tenant.old_address && <p><strong>Old Address:</strong> {tenant.old_address}</p>}
                    {tenant.secret_code && (
                      <p className="inline-flex items-center gap-1.5 mt-2 bg-secondary/50 p-2 rounded-lg border border-border w-fit">
                        <KeyRound size={14} className="text-primary" />
                        <strong>Tenant Login Code:</strong> <code className="text-primary font-bold">{tenant.secret_code}</code>
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(true)} className="px-3 py-1.5 rounded-lg border border-border text-sm">Edit</button>
                <button onClick={removeTenant} className="px-3 py-1.5 rounded-lg border border-border text-sm text-destructive inline-flex items-center gap-1">
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-border">
              <Stat label="Monthly rent" value={currency(tenant.monthly_rent)} />
              <Stat label="Advance paid" value={currency(tenant.advance ?? 0)} />
              <Stat label={`${MONTHS[m - 1]} ${y}`} value={paid ? "Paid" : "Pending"} tone={paid ? "good" : "warn"} icon={paid ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} />
              <div className="flex items-end">
                {paid ? (
                  <span className="text-sm text-muted-foreground">Already collected.</span>
                ) : (
                  <button onClick={markPaid} className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm shadow-[var(--shadow-soft)]">
                    Mark {MONTHS[m - 1]} as paid
                  </button>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Send alert</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://wa.me/${phoneDigits}?text=${reminderMsg}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm px-3 py-2 rounded-lg bg-warning/10 text-warning inline-flex items-center gap-1.5 hover:bg-warning/20"
                >
                  <BellRing size={14} /> Rent reminder
                </a>
                <a
                  href={`https://wa.me/${phoneDigits}?text=${receiptMsg}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm px-3 py-2 rounded-lg bg-success/15 text-success inline-flex items-center gap-1.5 hover:opacity-90"
                >
                  <Receipt size={14} /> Send receipt
                </a>
                <a
                  href={`https://wa.me/${phoneDigits}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm px-3 py-2 rounded-lg border border-border inline-flex items-center gap-1.5 hover:bg-secondary"
                >
                  <MessageCircle size={14} /> Custom message
                </a>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No tenant. Click below to add one.</p>
        )}
      </div>
      
      {tenant && tenantIssues.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-xl mb-4">Reported Issues</h2>
          <div className="divide-y divide-border">
            {tenantIssues.map((issue) => (
              <div key={issue.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between">
                <div>
                  <p className="font-medium inline-flex items-center gap-2">
                    {issue.status === "open" ? <AlertCircle size={14} className="text-warning" /> : <CheckCircle2 size={14} className="text-success" />}
                    {issue.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">Reported on {new Date(issue.created_at).toLocaleDateString()}</p>
                </div>
                {issue.status === 'open' && (
                  <button onClick={() => resolveIssue(issue.id)} className="text-xs px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors">
                    Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tenant && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="font-display text-xl">Transaction history</h2>
              <p className="text-xs text-muted-foreground mt-1">{history.length} payment{history.length === 1 ? "" : "s"} since {tenant.moved_in}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Lifetime collected</p>
              <p className="font-display text-2xl">{currency(totalCollected)}</p>
            </div>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {history.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium inline-flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-success" />
                      {MONTHS[p.month - 1]} {p.year}
                    </p>
                    <p className="text-xs text-muted-foreground ml-5">Verified · paid on {p.paid_on}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-display text-lg">{currency(p.amount)}</p>
                    <button
                      onClick={async () => {
                        if (!confirm("Delete this payment?")) return;
                        await deletePayment(p.id);
                      }}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`.input{width:100%;padding:.6rem .8rem;border-radius:.5rem;background:var(--color-background);border:1px solid var(--color-input);font-size:.9rem;}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Stat({ label, value, tone, icon }: { label: string; value: string; tone?: "good" | "warn"; icon?: React.ReactNode }) {
  const color =
    tone === "good" ? "text-success" : tone === "warn" ? "text-warning" : "";
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`font-display text-xl mt-1 inline-flex items-center gap-1.5 ${color}`}>
        {icon}{value}
      </p>
    </div>
  );
}