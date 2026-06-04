import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import type { User, Session } from "@supabase/supabase-js";

// ─── Types ───────────────────────────────────────────────────
type TenantSession = { role: "tenant"; tenantId: string };
type OwnerSession  = { role: "owner";  user: User };
type AppSession    = OwnerSession | TenantSession | null;

type AuthCtx = {
  session:       AppSession;
  ownerUser:     User | null;
  loading:       boolean;
  // Owner auth (Supabase)
  register:      (email: string, password: string) => Promise<{ error: string | null }>;
  loginOwner:    (email: string, password: string) => Promise<{ error: string | null }>;
  forgotPassword:(email: string)                   => Promise<{ error: string | null }>;
  logout:        ()                                => Promise<void>;
  // Tenant auth (secret code lookup, no Supabase Auth)
  loginTenant:   (tenantId: string) => void;
  logoutTenant:  () => void;
};

const TENANT_KEY = "slk-tenant-session-v2";
const AuthContext = createContext<AuthCtx | null>(null);

// ─── Provider ────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [ownerUser,    setOwnerUser]    = useState<User | null>(null);
  const [tenantSession, setTenantSession] = useState<TenantSession | null>(null);
  const [loading,      setLoading]      = useState(true);

  // Restore Supabase owner session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setOwnerUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session: Session | null) => {
        setOwnerUser(session?.user ?? null);
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  // Restore tenant session from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TENANT_KEY);
      if (raw) setTenantSession(JSON.parse(raw));
    } catch {}
  }, []);

  // ─── Owner Auth helpers ───────────────────────────────────
  const register = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  };

  const loginOwner = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    return { error: error?.message ?? null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(TENANT_KEY);
    setTenantSession(null);
  };

  // ─── Tenant Auth helpers ──────────────────────────────────
  const loginTenant = (tenantId: string) => {
    const s: TenantSession = { role: "tenant", tenantId };
    setTenantSession(s);
    localStorage.setItem(TENANT_KEY, JSON.stringify(s));
  };

  const logoutTenant = () => {
    setTenantSession(null);
    localStorage.removeItem(TENANT_KEY);
  };

  // ─── Derive combined session ──────────────────────────────
  let session: AppSession = null;
  if (tenantSession) {
    session = tenantSession;
  } else if (ownerUser) {
    session = { role: "owner", user: ownerUser };
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        ownerUser,
        loading,
        register,
        loginOwner,
        forgotPassword,
        logout,
        loginTenant,
        logoutTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}