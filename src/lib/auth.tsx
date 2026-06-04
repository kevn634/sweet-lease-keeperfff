import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";

type TenantSession = { role: "tenant"; tenantId: string };
type OwnerSession  = { role: "owner";  user: User };
type AppSession    = OwnerSession | TenantSession | null;

type AuthCtx = {
  session:       AppSession;
  ownerUser:     User | null;
  loading:       boolean;
  register:      (email: string, password: string) => Promise<{ error: string | null }>;
  loginOwner:    (email: string, password: string) => Promise<{ error: string | null }>;
  forgotPassword:(email: string)                   => Promise<{ error: string | null }>;
  logout:        ()                                => Promise<void>;
  loginTenant:   (tenantId: string) => void;
  logoutTenant:  () => void;
};

const TENANT_KEY = "slk-tenant-session-v2";
const AuthContext = createContext<AuthCtx | null>(null);

const MOCK_USER = { id: "mock-owner", email: "demo@test.com" } as User;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ownerUser, setOwnerUser] = useState<User | null>(MOCK_USER);
  const [tenantSession, setTenantSession] = useState<TenantSession | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TENANT_KEY);
      if (raw) setTenantSession(JSON.parse(raw));
    } catch {}
  }, []);

  const register = async () => ({ error: null });
  const loginOwner = async () => { setOwnerUser(MOCK_USER); return { error: null }; };
  const forgotPassword = async () => ({ error: null });
  const logout = async () => { setOwnerUser(null); setTenantSession(null); localStorage.removeItem(TENANT_KEY); };
  
  const loginTenant = (tenantId: string) => {
    const s: TenantSession = { role: "tenant", tenantId };
    setTenantSession(s);
    localStorage.setItem(TENANT_KEY, JSON.stringify(s));
  };
  const logoutTenant = () => { setTenantSession(null); localStorage.removeItem(TENANT_KEY); };

  let session: AppSession = null;
  if (tenantSession) session = tenantSession;
  else if (ownerUser) session = { role: "owner", user: ownerUser };

  return (
    <AuthContext.Provider value={{ session, ownerUser, loading, register, loginOwner, forgotPassword, logout, loginTenant, logoutTenant }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}