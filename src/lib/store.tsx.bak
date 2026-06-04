import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

// ─── Types ───────────────────────────────────────────────────
export type Property = {
  id:          string;
  owner_id:    string;
  name:        string;
  address:     string;
  description?: string;
  created_at:  string;
};

export type House = {
  id:          string;
  owner_id:    string;
  property_id: string;
  number:      string;
  status:      "occupied" | "vacant";
};

export type Tenant = {
  id:           string;
  owner_id:     string;
  house_id:     string;
  name:         string;
  phone:        string;
  monthly_rent: number;
  moved_in:     string;
  advance?:     number;
  photo?:       string;
  old_address?: string;
  aadhar_card?: string;
  secret_code?: string;
};

export type Payment = {
  id:        string;
  owner_id:  string;
  tenant_id: string;
  amount:    number;
  month:     number;
  year:      number;
  paid_on:   string;
  note?:     string;
};

export type Expense = {
  id:           string;
  owner_id:     string;
  property_id?: string;
  category:     string;
  amount:       number;
  date:         string;
  description?: string;
};

export type Issue = {
  id:          string;
  owner_id?:   string;
  tenant_id:   string;
  house_id:    string;
  title:       string;
  description: string;
  status:      "open" | "resolved";
  created_at:  string;
};

type Data = {
  properties: Property[];
  houses:     House[];
  tenants:    Tenant[];
  payments:   Payment[];
  expenses:   Expense[];
  issues:     Issue[];
};

type Ctx = {
  data:          Data;
  loading:       boolean;
  refresh:       () => Promise<void>;
  // Properties
  addProperty:    (name: string, address: string, description?: string) => Promise<void>;
  updateProperty: (id: string, name: string, address: string, description?: string) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  // Houses
  addHouse:    (propertyId: string, number: string) => Promise<void>;
  deleteHouse: (id: string) => Promise<void>;
  // Tenants
  saveTenant:   (tenant: Partial<Tenant> & { house_id: string }) => Promise<void>;
  removeTenant: (id: string) => Promise<void>;
  // Payments
  togglePaid:    (tenantId: string, amount: number, month: number, year: number, existingId?: string) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  // Expenses
  addExpense:    (expense: Omit<Expense, "id" | "owner_id">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  // Issues
  addIssue:    (tenantId: string, houseId: string, title: string, description: string) => Promise<void>;
  resolveIssue: (id: string) => Promise<void>;
};

const StoreContext = createContext<Ctx | null>(null);

// ─── Helpers ─────────────────────────────────────────────────
export const uid = () => crypto.randomUUID();

export function isPaid(payments: Payment[], tenantId: string, month: number, year: number) {
  return payments.some(
    (p) => p.tenant_id === tenantId && p.month === month && p.year === year
  );
}

export function currency(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

// ─── Provider ────────────────────────────────────────────────
export function StoreProvider({
  children,
  user,
}: {
  children: ReactNode;
  user: User | null;
}) {
  const emptyData: Data = {
    properties: [],
    houses:     [],
    tenants:    [],
    payments:   [],
    expenses:   [],
    issues:     [],
  };

  const [data,    setData]    = useState<Data>(emptyData);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!user) {
      setData(emptyData);
      return;
    }
    setLoading(true);
    try {
      const [
        { data: properties },
        { data: houses },
        { data: tenants },
        { data: payments },
        { data: expenses },
        { data: issues },
      ] = await Promise.all([
        supabase.from("properties").select("*").order("created_at"),
        supabase.from("houses").select("*"),
        supabase.from("tenants").select("*"),
        supabase.from("payments").select("*"),
        supabase.from("expenses").select("*"),
        supabase.from("issues").select("*"),
      ]);

      setData({
        properties: properties ?? [],
        houses:     houses     ?? [],
        tenants:    tenants    ?? [],
        payments:   payments   ?? [],
        expenses:   expenses   ?? [],
        issues:     issues     ?? [],
      });
    } catch (err) {
      console.error("StoreProvider refresh error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [user?.id]);

  // ─── Properties ──────────────────────────────────────────
  const addProperty = async (name: string, address: string, description?: string) => {
    if (!user) return;
    const { error } = await supabase.from("properties").insert([{
      id: uid(), owner_id: user.id, name, address, description,
    }]);
    if (error) {
      console.error("Failed to add property:", error);
      alert(`Failed to add property: ${error.message}`);
    }
    await refresh();
  };

  const updateProperty = async (id: string, name: string, address: string, description?: string) => {
    const { error } = await supabase.from("properties").update({ name, address, description }).eq("id", id);
    if (error) alert(`Failed to update property: ${error.message}`);
    await refresh();
  };

  const deleteProperty = async (id: string) => {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) alert(`Failed to delete property: ${error.message}`);
    await refresh();
  };

  // ─── Houses ──────────────────────────────────────────────
  const addHouse = async (propertyId: string, number: string) => {
    if (!user) return;
    const { error } = await supabase.from("houses").insert([{
      id: uid(), owner_id: user.id, property_id: propertyId, number, status: "vacant",
    }]);
    if (error) alert(`Failed to add house: ${error.message}`);
    await refresh();
  };

  const deleteHouse = async (id: string) => {
    await supabase.from("houses").delete().eq("id", id);
    await refresh();
  };

  // ─── Tenants ─────────────────────────────────────────────
  const saveTenant = async (tenant: Partial<Tenant> & { house_id: string }) => {
    if (!user) return;
    if (tenant.id) {
      // Update existing
      const { id, ...rest } = tenant;
      await supabase.from("tenants").update(rest).eq("id", id);
    } else {
      // Create new
      const secret_code = tenant.secret_code ?? generateSecretCode();
      await supabase.from("tenants").insert([{
        id: uid(),
        owner_id: user.id,
        moved_in: new Date().toISOString().slice(0, 10),
        secret_code,
        ...tenant,
      }]);
      await supabase.from("houses").update({ status: "occupied" }).eq("id", tenant.house_id);
    }
    await refresh();
  };

  const removeTenant = async (id: string) => {
    const t = data.tenants.find((x) => x.id === id);
    if (!t) return;
    await supabase.from("tenants").delete().eq("id", id);
    await supabase.from("houses").update({ status: "vacant" }).eq("id", t.house_id);
    await refresh();
  };

  // ─── Payments ────────────────────────────────────────────
  const togglePaid = async (
    tenantId: string,
    amount: number,
    month: number,
    year: number,
    existingId?: string
  ) => {
    if (!user) return;
    if (existingId) {
      await supabase.from("payments").delete().eq("id", existingId);
    } else {
      await supabase.from("payments").insert([{
        id: uid(),
        owner_id: user.id,
        tenant_id: tenantId,
        amount,
        month,
        year,
        paid_on: new Date().toISOString().slice(0, 10),
      }]);
    }
    await refresh();
  };

  const deletePayment = async (id: string) => {
    await supabase.from("payments").delete().eq("id", id);
    await refresh();
  };

  // ─── Expenses ────────────────────────────────────────────
  const addExpense = async (expense: Omit<Expense, "id" | "owner_id">) => {
    if (!user) return;
    await supabase.from("expenses").insert([{
      id: uid(), owner_id: user.id, ...expense,
    }]);
    await refresh();
  };

  const deleteExpense = async (id: string) => {
    await supabase.from("expenses").delete().eq("id", id);
    await refresh();
  };

  // ─── Issues ──────────────────────────────────────────────
  const addIssue = async (
    tenantId: string,
    houseId: string,
    title: string,
    description: string
  ) => {
    // Find owner_id from the house (issues can be inserted by unauthenticated tenants)
    const house = data.houses.find((h) => h.id === houseId);
    await supabase.from("issues").insert([{
      id: uid(),
      owner_id: house?.owner_id ?? null,
      tenant_id: tenantId,
      house_id: houseId,
      title,
      description,
      status: "open",
    }]);
    await refresh();
  };

  const resolveIssue = async (id: string) => {
    await supabase.from("issues").update({ status: "resolved" }).eq("id", id);
    await refresh();
  };

  return (
    <StoreContext.Provider
      value={{
        data,
        loading,
        refresh,
        addProperty,
        updateProperty,
        deleteProperty,
        addHouse,
        deleteHouse,
        saveTenant,
        removeTenant,
        togglePaid,
        deletePayment,
        addExpense,
        deleteExpense,
        addIssue,
        resolveIssue,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

// ─── Utility ─────────────────────────────────────────────────
function generateSecretCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}