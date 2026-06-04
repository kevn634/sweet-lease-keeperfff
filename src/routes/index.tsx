import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { KeyRound, UserRound, NotebookPen, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rithany Illam — Digital Rent Notebook" },
      { name: "description", content: "A calm, modern rent notebook for apartment owners and tenants." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <div className="max-w-6xl mx-auto px-6 py-10 md:py-20">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NotebookPen className="text-primary" size={22} />
            <span className="font-display text-lg">Rithany Illam</span>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1.5">
            <Sparkles size={12} /> Digital rent notebook
          </span>
        </header>

        <section className="mt-16 md:mt-28 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Est. apartment ledger</p>
          <h1 className="font-display text-5xl md:text-7xl mt-4 leading-[1.05] text-foreground">
            The notebook your apartment <em className="italic text-primary">deserves</em>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Houses, tenants, rent collections and expenses — all in one warm, quiet place.
            Built first for Rithany Illam.
          </p>

          <div className="mt-10 grid sm:grid-cols-2 gap-4 max-w-2xl">
            <Link
              to="/login"
              className="group flex items-start gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="font-display text-xl">Owner</h3>
                <p className="text-sm text-muted-foreground mt-1">Manage every house, tenant and rupee.</p>
              </div>
            </Link>
            <Link
              to="/tenant"
              className="group flex items-start gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="p-3 rounded-xl bg-accent/30 text-accent-foreground">
                <UserRound size={20} />
              </div>
              <div>
                <h3 className="font-display text-xl">Tenant</h3>
                <p className="text-sm text-muted-foreground mt-1">View your rent history and dues.</p>
              </div>
            </Link>
          </div>
        </section>

        <footer className="mt-24 text-xs text-muted-foreground">
          Demo data is stored locally on this device.
        </footer>
      </div>
    </div>
  );
}
