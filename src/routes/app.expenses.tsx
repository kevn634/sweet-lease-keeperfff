import { createFileRoute } from "@tanstack/react-router";
import { useStore, currency, MONTHS } from "@/lib/store";
import { useMemo, useState } from "react";
import { Trash2, Plus } from "lucide-react";

const CATEGORIES = ["Water", "Electricity", "Repairs", "Cleaning", "Other"];

export const Route = createFileRoute("/app/expenses")({
  component: ExpensesPage,
});

function ExpensesPage() {
  const { data, addExpense, deleteExpense } = useStore();
  const now = new Date();
  const [filterProp, setFilterProp] = useState<string>("all");
  const [form, setForm] = useState({
    category: "Water",
    amount: 0,
    date: now.toISOString().slice(0, 10),
    description: "",
    property_id: "",
  });

  const monthExpenses = useMemo(() => {
    return data.expenses
      .filter((e) => {
        const d = new Date(e.date);
        const matchMonth = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        if (!matchMonth) return false;
        if (filterProp !== "all" && (e as any).property_id && (e as any).property_id !== filterProp) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data.expenses, now, filterProp]);

  const totalThisMonth = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const collectedThisMonth = data.payments
    .filter((p) => p.month === now.getMonth() + 1 && p.year === now.getFullYear())
    .reduce((s, p) => s + p.amount, 0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.category || !amount || !form.date) return;

    await addExpense({
      category: form.category,
      amount,
      date: form.date,
      description: form.description,
      property_id: form.property_id || undefined,
    } as any);
    setForm({ category: "Water", amount: 0, date: new Date().toISOString().slice(0, 10), description: "", property_id: "" });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Outflows</p>
          <h1 className="font-display text-4xl mt-2">Expenses</h1>
        </div>
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
      <div className="grid grid-cols-3 gap-4">
        <Mini label={`${MONTHS[now.getMonth()]} collected`} value={currency(collectedThisMonth)} />
        <Mini label="Expenses" value={currency(totalThisMonth)} />
        <Mini label="Profit" value={currency(collectedThisMonth - totalThisMonth)} />
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <form onSubmit={handleAdd} className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-soft)] space-y-3">
          <h2 className="font-display text-xl">Log an expense</h2>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Category</span>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-input">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Amount (₹)</span>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-input" />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Date</span>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-input" />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Note</span>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-input" />
          </label>
          <button type="submit" className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm inline-flex items-center justify-center gap-1.5 shadow-[var(--shadow-soft)]">
            <Plus size={14} /> Add expense
          </button>
        </form>

        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-xl mb-4">{MONTHS[now.getMonth()]} {now.getFullYear()}</h2>
          {monthExpenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses recorded.</p>
          ) : (
            <div className="divide-y divide-border">
              {monthExpenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-3 gap-3">
                  <div>
                    <p className="font-medium">{e.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.date}{e.description ? ` · ${e.description}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-display text-lg">{currency(e.amount)}</p>
                    <button
                      onClick={() => deleteExpense(e.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-display text-2xl mt-1">{value}</p>
    </div>
  );
}