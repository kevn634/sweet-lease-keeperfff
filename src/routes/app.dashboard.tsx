import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, currency, isPaid, MONTHS } from "@/lib/store";
import { useMemo, useState } from "react";
import { Home, Users, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from "recharts";

export const Route = createFileRoute("/app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data } = useStore();
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();

  // Property filter: "all" or a specific property id
  const [selectedProp, setSelectedProp] = useState<string>("all");

  // Filter data to selected property
  const filteredHouses = useMemo(() => {
    if (selectedProp === "all") return data.houses;
    return data.houses.filter((h) => h.property_id === selectedProp);
  }, [data.houses, selectedProp]);

  const filteredTenants = useMemo(() => {
    const houseIds = new Set(filteredHouses.map((h) => h.id));
    return data.tenants.filter((t) => houseIds.has(t.house_id));
  }, [filteredHouses, data.tenants]);

  const filteredPayments = useMemo(() => {
    const tenantIds = new Set(filteredTenants.map((t) => t.id));
    return data.payments.filter((p) => tenantIds.has(p.tenant_id));
  }, [filteredTenants, data.payments]);

  const filteredExpenses = useMemo(() => {
    if (selectedProp === "all") return data.expenses;
    return data.expenses.filter((e) => (e as any).property_id === selectedProp || !(e as any).property_id);
  }, [data.expenses, selectedProp]);

  const stats = useMemo(() => {
    const occupied = filteredTenants.length;
    const totalHouses = filteredHouses.length;
    const vacant = filteredHouses.filter((h) => h.status === "vacant").length;
    const paid = filteredTenants.filter((t) => isPaid(filteredPayments, t.id, m, y));
    const pending = filteredTenants.filter((t) => {
      const movedInStr = t.moved_in || new Date().toISOString().slice(0, 10);
      const [movedYear, movedMonth] = movedInStr.split("-").map(Number);
      if (y < movedYear || (y === movedYear && m < movedMonth)) return false;
      return !isPaid(filteredPayments, t.id, m, y);
    });
    const collected     = paid.reduce((s, t) => s + t.monthly_rent, 0);
    const pendingAmount = pending.reduce((s, t) => s + t.monthly_rent, 0);
    const monthExpenses = filteredExpenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() + 1 === m && d.getFullYear() === y;
      })
      .reduce((s, e) => s + e.amount, 0);
    return { occupied, totalHouses, vacant, paid, pending, collected, pendingAmount, monthExpenses };
  }, [filteredTenants, filteredHouses, filteredPayments, filteredExpenses, m, y]);

  const chartData = useMemo(() => {
    const out: { month: string; Collected: number; Expenses: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d  = new Date(y, m - 1 - i, 1);
      const mm = d.getMonth() + 1;
      const yy = d.getFullYear();
      const collected = filteredPayments
        .filter((p) => p.month === mm && p.year === yy)
        .reduce((s, p) => s + p.amount, 0);
      const expenses = filteredExpenses
        .filter((e) => {
          const dd = new Date(e.date);
          return dd.getMonth() + 1 === mm && dd.getFullYear() === yy;
        })
        .reduce((s, e) => s + e.amount, 0);
      out.push({ month: MONTHS[mm - 1], Collected: collected, Expenses: expenses });
    }
    return out;
  }, [filteredPayments, filteredExpenses, m, y]);

  const profit = stats.collected - stats.monthExpenses;

  const cards = [
    { label: "Properties", value: data.properties.length, sub: "total",    icon: Building2 },
    { label: "Houses",     value: `${stats.occupied}/${stats.totalHouses}`, sub: "occupied", icon: Home },
    { label: "Collected",  value: currency(stats.collected),  sub: `${MONTHS[m - 1]} ${y}`,       icon: CheckCircle2, accent: "success" as const },
    { label: "Pending",    value: currency(stats.pendingAmount), sub: `${stats.pending.length} tenants`, icon: AlertCircle,  accent: "warn"    as const },
  ];

  const hasData = data.properties.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {MONTHS[m - 1]} {y}
          </p>
          <h1 className="font-display text-4xl mt-2">Dashboard</h1>
        </div>

        {/* Property selector */}
        {data.properties.length > 0 && (
          <select
            value={selectedProp}
            onChange={(e) => setSelectedProp(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-card text-sm shadow-[var(--shadow-soft)] focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Properties</option>
            {data.properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Empty state */}
      {!hasData ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center shadow-[var(--shadow-soft)]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary text-secondary-foreground mb-4">
            <Building2 size={24} />
          </div>
          <h2 className="font-display text-2xl mb-2">No properties added yet</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Start by adding your first property to manage houses, tenants, payments, and expenses.
          </p>
          <Link
            to="/app/properties"
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 inline-block shadow-[var(--shadow-soft)]"
          >
            Add your first property
          </Link>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-soft)]">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
                    <Icon
                      size={16}
                      className={
                        c.accent === "success" ? "text-success" :
                        c.accent === "warn"    ? "text-warning" :
                        "text-muted-foreground"
                      }
                    />
                  </div>
                  <p className="font-display text-3xl mt-3">{c.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Chart + This month */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl">Last 6 months</h2>
                <p className="text-xs text-muted-foreground">Collected vs Expenses</p>
              </div>
              <div style={{ width: "100%", height: 260 }}>
                {filteredPayments.length === 0 && filteredExpenses.length === 0 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                    <TrendingUp size={32} className="mb-2 opacity-20" />
                    <p className="text-sm">No chart data yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 260)" />
                      <XAxis dataKey="month" stroke="oklch(0.52 0.02 260)" fontSize={12} />
                      <YAxis stroke="oklch(0.52 0.02 260)" fontSize={12} />
                      <Tooltip
                        contentStyle={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.01 260)", borderRadius: 12 }}
                        formatter={(v: number) => currency(v)}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Collected" fill="oklch(0.3 0.05 260)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Expenses"  fill="oklch(0.6 0.06 260)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-soft)] flex flex-col">
              <h2 className="font-display text-xl mb-4">This month</h2>
              <div className="space-y-4 flex-1">
                <Row icon={<TrendingUp size={14} />}   label="Collected" value={currency(stats.collected)}     tone="up" />
                <Row icon={<TrendingDown size={14} />} label="Expenses"  value={currency(stats.monthExpenses)} tone="down" />
                <div className="border-t border-border pt-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Net profit</p>
                  <p className="font-display text-3xl mt-1">{currency(profit)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending reminders */}
          {stats.pending.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-soft)]">
              <h2 className="font-display text-xl mb-4">Pending this month</h2>
              <div className="divide-y divide-border">
                {stats.pending.map((t) => {
                  const house = data.houses.find((h) => h.id === t.house_id);
                  const prop  = data.properties.find((p) => p.id === house?.property_id);
                  const msg   = encodeURIComponent(
                    `Hi ${t.name}, this is a gentle reminder for your ${MONTHS[m - 1]} ${y} rent of ₹${t.monthly_rent.toLocaleString("en-IN")} for ${house?.number} at ${prop?.name ?? ""}. Thank you!`
                  );
                  return (
                    <div key={t.id} className="flex items-center justify-between py-3 gap-4 flex-wrap">
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {prop?.name} · {house?.number} · {currency(t.monthly_rent)}
                        </p>
                      </div>
                      <a
                        href={`https://wa.me/${t.phone.replace(/\D/g, "")}?text=${msg}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                      >
                        Send reminder
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Row({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "up" | "down" }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={tone === "up" ? "text-success" : "text-warning"}>{icon}</span>
        {label}
      </div>
      <p className="font-display text-lg">{value}</p>
    </div>
  );
}