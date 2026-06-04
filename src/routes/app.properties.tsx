import { createFileRoute } from "@tanstack/react-router";
import { useStore, currency } from "@/lib/store";
import { useState } from "react";
import { Building2, Plus, Pencil, Trash2, Home, Users, Check, X } from "lucide-react";

export const Route = createFileRoute("/app/properties")({
  component: PropertiesPage,
});

type FormState = { name: string; address: string; description: string };
const emptyForm: FormState = { name: "", address: "", description: "" };

function PropertiesPage() {
  const { data, loading, addProperty, updateProperty, deleteProperty } = useStore();

  const [showAdd,     setShowAdd]     = useState(false);
  const [addForm,     setAddForm]     = useState<FormState>(emptyForm);
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [editForm,    setEditForm]    = useState<FormState>(emptyForm);
  const [busyId,      setBusyId]      = useState<string | null>(null);

  // ── Derived stats per property ────────────────────────────
  const propertyStats = data.properties.map((prop) => {
    const houses  = data.houses.filter((h) => h.property_id === prop.id);
    const tenants = data.tenants.filter((t) =>
      houses.some((h) => h.id === t.house_id)
    );
    const now       = new Date();
    const m         = now.getMonth() + 1;
    const y         = now.getFullYear();
    const collected = data.payments
      .filter((p) =>
        tenants.some((t) => t.id === p.tenant_id) && p.month === m && p.year === y
      )
      .reduce((s, p) => s + p.amount, 0);
    return { prop, houses, tenants, collected };
  });

  // ── Handlers ─────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) return;
    setBusyId("add");
    await addProperty(addForm.name.trim(), addForm.address.trim(), addForm.description.trim() || undefined);
    setAddForm(emptyForm);
    setShowAdd(false);
    setBusyId(null);
  };

  const startEdit = (prop: typeof data.properties[0]) => {
    setEditingId(prop.id);
    setEditForm({ name: prop.name, address: prop.address, description: prop.description ?? "" });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setBusyId(editingId);
    await updateProperty(editingId, editForm.name.trim(), editForm.address.trim(), editForm.description.trim() || undefined);
    setEditingId(null);
    setBusyId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property and all its houses, tenants, and payments?")) return;
    setBusyId(id);
    await deleteProperty(id);
    setBusyId(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Portfolio</p>
          <h1 className="font-display text-4xl mt-2">Properties</h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 shadow-[var(--shadow-soft)] transition-opacity"
        >
          <Plus size={16} /> Add Property
        </button>
      </div>

      {/* Add Property Form */}
      {showAdd && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-xl mb-4">New property</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Property name *">
                <input
                  required autoFocus
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Rithany Illam"
                  className="input"
                />
              </Field>
              <Field label="Address">
                <input
                  value={addForm.address}
                  onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  placeholder="12, Anna Nagar, Chennai"
                  className="input"
                />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <input
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  placeholder="Optional notes"
                  className="input"
                />
              </Field>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={busyId === "add"}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {busyId === "add" ? "Saving…" : "Create property"}
              </button>
              <button
                type="button"
                onClick={() => { setShowAdd(false); setAddForm(emptyForm); }}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty state */}
      {data.properties.length === 0 && !loading && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-[var(--shadow-soft)]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary text-secondary-foreground mb-4">
            <Building2 size={24} />
          </div>
          <h2 className="font-display text-2xl mb-2">No properties yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            Add your first property to start managing houses, tenants, and rent payments.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 shadow-[var(--shadow-soft)]"
          >
            Add your first property
          </button>
        </div>
      )}

      {/* Property cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {propertyStats.map(({ prop, houses, tenants, collected }) => {
          const occupied = houses.filter((h) => h.status === "occupied").length;
          const isEditing = editingId === prop.id;

          return (
            <div
              key={prop.id}
              className="bg-card border border-border rounded-2xl shadow-[var(--shadow-soft)] overflow-hidden"
            >
              {/* Card header */}
              <div className="p-5 border-b border-border">
                {isEditing ? (
                  <form onSubmit={handleEdit} className="space-y-2">
                    <input
                      autoFocus
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-background border border-input text-sm"
                    />
                    <input
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      placeholder="Address"
                      className="w-full px-3 py-1.5 rounded-lg bg-background border border-input text-sm"
                    />
                    <input
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Description (optional)"
                      className="w-full px-3 py-1.5 rounded-lg bg-background border border-input text-sm"
                    />
                    <div className="flex gap-2 pt-1">
                      <button type="submit" disabled={busyId === prop.id} className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
                        <Check size={14} />
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="p-1.5 rounded-lg border border-border hover:bg-secondary">
                        <X size={14} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-xl leading-tight">{prop.name}</h3>
                      {prop.address && (
                        <p className="text-xs text-muted-foreground mt-1">{prop.address}</p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => startEdit(prop)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(prop.id)}
                        disabled={busyId === prop.id}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 divide-x divide-border">
                <Stat icon={<Home size={14} />} value={`${occupied}/${houses.length}`} label="Houses" />
                <Stat icon={<Users size={14} />} value={tenants.length} label="Tenants" />
                <Stat icon={<span className="text-xs font-bold">₹</span>} value={currency(collected).replace("₹", "")} label="This month" />
              </div>
            </div>
          );
        })}
      </div>

      <style>{`.input{width:100%;padding:.6rem .8rem;border-radius:.5rem;background:var(--color-background);border:1px solid var(--color-input);font-size:.875rem;}`}</style>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="p-4 text-center">
      <div className="flex items-center justify-center text-muted-foreground mb-1">{icon}</div>
      <p className="font-display text-xl">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}
