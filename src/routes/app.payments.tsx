import { createFileRoute } from "@tanstack/react-router";
import { useStore, currency, isPaid, MONTHS } from "@/lib/store";
import { useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/app/payments")({
  component: PaymentsPage,
});

function PaymentsPage() {
  const { data, togglePaid } = useStore();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [filterProp, setFilterProp] = useState<string>("all");

  const rows = useMemo(() => {
    return data.tenants
      .filter((t) => {
        // Only show tenants who had moved in by this month
        const movedInStr = t.moved_in || new Date().toISOString().slice(0, 10);
        const [movedYear, movedMonth] = movedInStr.split("-").map(Number);
        if (year < movedYear || (year === movedYear && month < movedMonth)) return false;
        // Property filter
        if (filterProp !== "all") {
          const house = data.houses.find((h) => h.id === t.house_id);
          if (house?.property_id !== filterProp) return false;
        }
        return true;
      })
      .map((t) => {
        const house   = data.houses.find((h) => h.id === t.house_id);
        const prop    = data.properties.find((p) => p.id === house?.property_id);
        const payment = data.payments.find(
          (p) => p.tenant_id === t.id && p.month === month && p.year === year
        );
        return { tenant: t, house, prop, payment };
      });
  }, [data, month, year, filterProp]);

  const paidCount      = rows.filter((r) => r.payment).length;
  const totalCollected = rows.filter((r) => r.payment).reduce((s, r) => s + (r.payment?.amount ?? 0), 0);
  const totalPending   = rows.filter((r) => !r.payment).reduce((s, r) => s + r.tenant.monthly_rent, 0);

  const handleTogglePaid = async (tenantId: string, amount: number, existingId?: string) => {
    await togglePaid(tenantId, amount, month, year, existingId);
  };

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Rent</p>
        <h1 className="font-display text-4xl mt-2">Payments</h1>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        {/* Month */}
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm shadow-[var(--shadow-soft)] focus:outline-none"
        >
          {MONTHS.map((mo, i) => (
            <option key={mo} value={i + 1}>{mo}</option>
          ))}
        </select>

        {/* Year */}
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm shadow-[var(--shadow-soft)] focus:outline-none"
        >
          {years.map((yr) => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>

        {/* Property filter */}
        {data.properties.length > 1 && (
          <select
            value={filterProp}
            onChange={(e) => setFilterProp(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm shadow-[var(--shadow-soft)] focus:outline-none"
          >
            <option value="all">All Properties</option>
            {data.properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Paid",      value: `${paidCount} / ${rows.length}`,  tone: "" },
          { label: "Collected", value: currency(totalCollected), tone: "text-success" },
          { label: "Pending",   value: currency(totalPending),  tone: "text-warning" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-soft)]">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className={`font-display text-2xl mt-2 ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[var(--shadow-soft)]">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No payment records for this period.</p>
        ) : (
          <div className="divide-y divide-border">
            {rows.map(({ tenant, house, prop, payment }) => {
              const msg = encodeURIComponent(
                `Hi ${tenant.name}, this is a gentle reminder for your ${MONTHS[month - 1]} ${year} rent of ₹${tenant.monthly_rent.toLocaleString("en-IN")} for ${house?.number} at ${prop?.name ?? ""}. Thank you!`
              );
              return (
                <div key={tenant.id} className="flex items-center justify-between p-4 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        payment ? "bg-success" : "bg-warning"
                      }`}
                    />
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {prop?.name && `${prop.name} · `}{house?.number} · {currency(tenant.monthly_rent)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!payment && (
                      <a
                        href={`https://wa.me/${tenant.phone.replace(/\D/g, "")}?text=${msg}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs px-3 py-2 rounded-lg border border-border inline-flex items-center gap-1.5 hover:bg-secondary"
                      >
                        <MessageCircle size={13} /> WhatsApp
                      </a>
                    )}
                    <button
                      onClick={() => handleTogglePaid(tenant.id, tenant.monthly_rent, payment?.id)}
                      className={`text-xs px-3 py-2 rounded-lg inline-flex items-center gap-1.5 ${
                        payment
                          ? "border border-border hover:bg-secondary"
                          : "bg-primary text-primary-foreground hover:opacity-90"
                      }`}
                    >
                      {payment ? (
                        <><CheckCircle2 size={13} className="text-success" /> Paid</>
                      ) : (
                        <><AlertCircle size={13} /> Mark paid</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}