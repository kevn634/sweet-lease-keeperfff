import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

export type Property = { id: string; owner_id: string; name: string; address: string; description?: string; created_at: string; };
export type House = { id: string; owner_id: string; property_id: string; number: string; status: "occupied" | "vacant"; };
export type Tenant = { id: string; owner_id: string; house_id: string; name: string; phone: string; monthly_rent: number; moved_in: string; advance?: number; secret_code?: string; };
export type Payment = { id: string; owner_id: string; tenant_id: string; amount: number; month: number; year: number; paid_on: string; note?: string; };
export type Expense = { id: string; owner_id: string; property_id?: string; category: string; amount: number; date: string; description?: string; };
export type Issue = { id: string; owner_id?: string; tenant_id: string; house_id: string; title: string; description: string; status: "open" | "resolved"; created_at: string; };

type Data = { properties: Property[]; houses: House[]; tenants: Tenant[]; payments: Payment[]; expenses: Expense[]; issues: Issue[]; };
type Ctx = {
  data: Data; loading: boolean; refresh: () => Promise<void>;
  addProperty: (n: string, a: string, d?: string) => Promise<void>; updateProperty: (i: string, n: string, a: string, d?: string) => Promise<void>; deleteProperty: (i: string) => Promise<void>;
  addHouse: (p: string, n: string) => Promise<void>; deleteHouse: (i: string) => Promise<void>;
  saveTenant: (t: Partial<Tenant> & { house_id: string }) => Promise<void>; removeTenant: (i: string) => Promise<void>;
  togglePaid: (t: string, a: number, m: number, y: number, e?: string) => Promise<void>; deletePayment: (i: string) => Promise<void>;
  addExpense: (e: Omit<Expense, "id" | "owner_id">) => Promise<void>; deleteExpense: (i: string) => Promise<void>;
  addIssue: (t: string, h: string, ti: string, d: string) => Promise<void>; resolveIssue: (i: string) => Promise<void>;
};

const StoreContext = createContext<Ctx | null>(null);

export const uid = () => crypto.randomUUID();
export function isPaid(payments: Payment[], tenantId: string, month: number, year: number) { return payments.some((p) => p.tenant_id === tenantId && p.month === month && p.year === year); }
export function currency(n: number) { return `₹${n.toLocaleString("en-IN")}`; }
export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const INITIAL_MOCK_DATA: Data = {
  properties: [
    { id: "p1", owner_id: "mock-owner", name: "Rithany Illam", address: "42 Beach Road, Chennai", created_at: new Date().toISOString() }
  ],
  houses: [
    { id: "h1", owner_id: "mock-owner", property_id: "p1", number: "101", status: "occupied" },
    { id: "h2", owner_id: "mock-owner", property_id: "p1", number: "102", status: "vacant" }
  ],
  tenants: [
    { id: "t1", owner_id: "mock-owner", house_id: "h1", name: "Kavin Kumar", phone: "9876543210", monthly_rent: 15000, moved_in: "2024-01-01", secret_code: "DEMO1" }
  ],
  payments: [
    { id: "pay1", owner_id: "mock-owner", tenant_id: "t1", amount: 15000, month: new Date().getMonth() + 1, year: new Date().getFullYear(), paid_on: new Date().toISOString().slice(0, 10) }
  ],
  expenses: [],
  issues: [
    { id: "i1", owner_id: "mock-owner", tenant_id: "t1", house_id: "h1", title: "Leaking Faucet", description: "Kitchen tap is leaking constantly.", status: "open", created_at: new Date().toISOString() }
  ]
};

export function StoreProvider({ children, user }: { children: ReactNode; user: User | null }) {
  const [data, setData] = useState<Data>(INITIAL_MOCK_DATA);
  const loading = false;

  const refresh = async () => {}; // No-op for mock

  const addProperty = async (name: string, address: string, description?: string) => {
    setData(d => ({ ...d, properties: [...d.properties, { id: uid(), owner_id: "mock-owner", name, address, description, created_at: new Date().toISOString() }] }));
  };
  const updateProperty = async (id: string, name: string, address: string, description?: string) => {
    setData(d => ({ ...d, properties: d.properties.map(p => p.id === id ? { ...p, name, address, description } : p) }));
  };
  const deleteProperty = async (id: string) => {
    setData(d => ({ ...d, properties: d.properties.filter(p => p.id !== id), houses: d.houses.filter(h => h.property_id !== id) }));
  };
  const addHouse = async (propertyId: string, number: string) => {
    setData(d => ({ ...d, houses: [...d.houses, { id: uid(), owner_id: "mock-owner", property_id: propertyId, number, status: "vacant" }] }));
  };
  const deleteHouse = async (id: string) => {
    setData(d => ({ ...d, houses: d.houses.filter(h => h.id !== id) }));
  };
  const saveTenant = async (t: Partial<Tenant> & { house_id: string }) => {
    setData(d => {
      if (t.id) {
        return { ...d, tenants: d.tenants.map(x => x.id === t.id ? { ...x, ...t } as Tenant : x) };
      }
      const newTenant = { id: uid(), owner_id: "mock-owner", moved_in: new Date().toISOString().slice(0, 10), secret_code: "DEMO" + Math.floor(Math.random()*1000), ...t } as Tenant;
      return { ...d, tenants: [...d.tenants, newTenant], houses: d.houses.map(h => h.id === t.house_id ? { ...h, status: "occupied" } : h) };
    });
  };
  const removeTenant = async (id: string) => {
    setData(d => {
      const t = d.tenants.find(x => x.id === id);
      if (!t) return d;
      return { ...d, tenants: d.tenants.filter(x => x.id !== id), houses: d.houses.map(h => h.id === t.house_id ? { ...h, status: "vacant" } : h) };
    });
  };
  const togglePaid = async (tId: string, amount: number, month: number, year: number, eId?: string) => {
    setData(d => {
      if (eId) return { ...d, payments: d.payments.filter(p => p.id !== eId) };
      return { ...d, payments: [...d.payments, { id: uid(), owner_id: "mock-owner", tenant_id: tId, amount, month, year, paid_on: new Date().toISOString().slice(0, 10) }] };
    });
  };
  const deletePayment = async (id: string) => setData(d => ({ ...d, payments: d.payments.filter(p => p.id !== id) }));
  const addExpense = async (e: Omit<Expense, "id" | "owner_id">) => setData(d => ({ ...d, expenses: [...d.expenses, { id: uid(), owner_id: "mock-owner", ...e }] }));
  const deleteExpense = async (id: string) => setData(d => ({ ...d, expenses: d.expenses.filter(e => e.id !== id) }));
  const addIssue = async (t: string, h: string, ti: string, desc: string) => setData(d => ({ ...d, issues: [...d.issues, { id: uid(), owner_id: "mock-owner", tenant_id: t, house_id: h, title: ti, description: desc, status: "open", created_at: new Date().toISOString() }] }));
  const resolveIssue = async (id: string) => setData(d => ({ ...d, issues: d.issues.map(i => i.id === id ? { ...i, status: "resolved" } : i) }));

  return (
    <StoreContext.Provider value={{ data, loading, refresh, addProperty, updateProperty, deleteProperty, addHouse, deleteHouse, saveTenant, removeTenant, togglePaid, deletePayment, addExpense, deleteExpense, addIssue, resolveIssue }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}