import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import {
  LayoutDashboard, Home, Wallet, Receipt,
  LogOut, Hammer, Building2, User,
} from "lucide-react";

const nav = [
  { to: "/app/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { to: "/app/properties", label: "Properties", icon: Building2 },
  { to: "/app/houses",     label: "Houses",     icon: Home },
  { to: "/app/payments",   label: "Payments",   icon: Wallet },
  { to: "/app/expenses",   label: "Expenses",   icon: Receipt },
  { to: "/app/issues",     label: "Issues",     icon: Hammer },
] as const;

export function OwnerLayout() {
  const { session, ownerUser, logout } = useAuth();
  const { data } = useStore();
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (!session || session.role !== "owner") {
      navigate({ to: "/login", replace: true });
    }
  }, [session, navigate]);

  if (!session || session.role !== "owner") return null;

  const openIssuesCount = data.issues.filter((i) => i.status === "open").length;
  const totalProperties = data.properties.length;

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/60 backdrop-blur sticky top-0 h-screen">
        {/* Brand */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
              <Building2 size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Sweet Lease Keeper</p>
              <p className="text-sm font-medium truncate mt-0.5">
                {totalProperties > 0
                  ? `${totalProperties} propert${totalProperties === 1 ? "y" : "ies"}`
                  : "No properties yet"}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map((n) => {
            const active = loc.pathname.startsWith(n.to);
            const Icon   = n.icon;
            const badge  = n.label === "Issues" ? openIssuesCount : 0;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                    : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  {n.label}
                </div>
                {badge > 0 && (
                  <span className="bg-warning text-warning-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-border space-y-1">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <User size={13} className="text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground truncate flex-1">
              {ownerUser?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar (header) ───────────────────────── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-card/90 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Building2 size={14} />
            </div>
            <span className="font-display text-lg">Lease Keeper</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* ── Mobile bottom nav ────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border safe-area-bottom">
        <nav className="flex items-center justify-around px-2 py-2">
          {nav.map((n) => {
            const active = loc.pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-colors ${
                  active ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} className="mb-1" />
                <span className="text-[9px] font-medium tracking-wide">{n.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <main className="flex-1 pt-14 pb-20 md:pt-0 md:pb-0 min-w-0">
        <div className="max-w-6xl mx-auto p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}