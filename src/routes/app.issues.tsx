import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Hammer, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/app/issues")({
  component: IssuesPage,
});

function IssuesPage() {
  const { data, resolveIssue } = useStore();

  const sortedIssues = [...data.issues].sort((a, b) => {
    // Open issues first, then by date descending
    if (a.status !== b.status) return a.status === "open" ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Maintenance</p>
        <h1 className="font-display text-4xl mt-2">Issues</h1>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[var(--shadow-soft)]">
        {sortedIssues.length === 0 ? (
          <div className="p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary text-secondary-foreground mb-4">
              <Hammer size={24} />
            </div>
            <h2 className="font-display text-2xl mb-2">No issues reported</h2>
            <p className="text-sm text-muted-foreground">Everything is running smoothly. Tenants can report maintenance issues from their portal.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sortedIssues.map((issue) => {
              const tenant = data.tenants.find(t => t.id === issue.tenant_id);
              const house = data.houses.find(h => h.id === issue.house_id);

              return (
                <div key={issue.id} className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className={`mt-1 flex-shrink-0 ${issue.status === "open" ? "text-warning" : "text-success"}`}>
                      {issue.status === "open" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                    </div>
                    <div>
                      <h3 className="font-display text-xl">{issue.title}</h3>
                      <p className="text-muted-foreground mt-1">{issue.description}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{house?.number}</span>
                        <span>Tenant: {tenant?.name}</span>
                        <span>Reported: {new Date(issue.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {issue.status === "open" && (
                    <button
                      onClick={async () => await resolveIssue(issue.id)}
                      className="whitespace-nowrap px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 shadow-[var(--shadow-soft)] transition-opacity"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
