import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, currency, isPaid } from "@/lib/store";
import { useState } from "react";
import { Home, Plus, X, CheckCircle2, AlertCircle, Building2 } from "lucide-react";

export const Route = createFileRoute("/app/houses")({
  component: HousesPage,
});

function HousesPage() {
  const { data, addHouse } = useStore();
  const [isAdding, setIsAdding]     = useState(false);
  const [newHouseName, setNewHouseName] = useState("");
  const [selectedPropId, setSelectedPropId] = useState<string>(() => data.properties[0]?.id ?? "");
  const [filterProp, setFilterProp] = useState<string>("all");
  const now = new Date();

  const handleAddHouse = async () => {
    if (!newHouseName.trim() || !selectedPropId) return;
    await addHouse(selectedPropId, newHouseName.trim());
    setIsAdding(false);
    setNewHouseName("");
  };

  // Filter houses by selected property
  const visibleHouses = filterProp === "all"
    ? data.houses
    : data.houses.filter((h) => h.property_id === filterProp);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Management</p>
          <h1 className="font-display text-4xl mt-2">Houses</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
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
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 shadow-[var(--shadow-soft)] transition-opacity"
          >
            <Plus size={16} /> Add House
          </button>
        </div>
      </div>

      {/* Add House Form */}
      {isAdding && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-xl mb-4">New house / unit</h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {data.properties.length > 1 && (
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Property</label>
                <select
                  value={selectedPropId}
                  onChange={(e) => setSelectedPropId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm"
                >
                  {data.properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">House / Unit number</label>
              <input
                autoFocus
                value={newHouseName}
                onChange={(e) => setNewHouseName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddHouse()}
                placeholder="e.g. 1A, Room 2, Flat 101"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddHouse}
              disabled={!newHouseName.trim() || !selectedPropId}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40"
            >
              Add house
            </button>
            <button
              onClick={() => { setIsAdding(false); setNewHouseName(""); }}
              className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* No properties yet */}
      {data.properties.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center shadow-[var(--shadow-soft)]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary text-secondary-foreground mb-4">
            <Building2 size={24} />
          </div>
          <h2 className="font-display text-2xl mb-2">Create a property first</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Houses must belong to a property. Go to Properties and add one first.
          </p>
          <Link
            to="/app/properties"
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 inline-block shadow-[var(--shadow-soft)]"
          >
            Go to Properties
          </Link>
        </div>
      ) : visibleHouses.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center shadow-[var(--shadow-soft)]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary text-secondary-foreground mb-4">
            <Home size={24} />
          </div>
          <h2 className="font-display text-2xl mb-2">No houses yet</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Click "Add House" to add your first unit.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleHouses.map((h) => {
            const tenant = data.tenants.find((t) => t.house_id === h.id);
            const prop   = data.properties.find((p) => p.id === h.property_id);
            const paid   = tenant
              ? isPaid(data.payments, tenant.id, now.getMonth() + 1, now.getFullYear())
              : false;

            return (
              <Link
                key={h.id}
                to="/app/houses/$id"
                params={{ id: h.id }}
                className="group bg-card border border-border rounded-2xl p-6 hover:shadow-[var(--shadow-elevated)] hover:border-primary/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-secondary text-secondary-foreground">
                    <Home size={18} />
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${
                      h.status === "occupied"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {h.status}
                  </span>
                </div>
                <h3 className="font-display text-2xl mt-4">{h.number}</h3>
                {prop && filterProp === "all" && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">{prop.name}</p>
                )}
                {tenant ? (
                  <>
                    <p className="text-sm text-muted-foreground mt-1">{tenant.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Advance {currency(tenant.advance ?? 0)}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="font-display text-lg">{currency(tenant.monthly_rent)}</p>
                      <span
                        className={`text-xs inline-flex items-center gap-1 ${
                          paid ? "text-success" : "text-warning"
                        }`}
                      >
                        {paid ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        {paid ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground mt-4">No tenant yet</p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}