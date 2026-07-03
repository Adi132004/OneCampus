import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SmartImage } from "@/components/SmartImage";
import { LOST_ITEMS } from "@/lib/mock-data";

export function LostFoundPage() {
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const items = LOST_ITEMS.filter(
    (i) => (tab === "All" || i.status === tab) && i.name.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <PageShell
      eyebrow="Lost & Found"
      title="Reunite items with their owners"
      subtitle="Browse recent reports or post your own."
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search items…"
            className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <Link
          to="/lost-found/report-lost"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          <Plus className="h-4 w-4" /> Report Lost
        </Link>
        <Link
          to="/lost-found/report-found"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          style={{
            boxShadow: "0 6px 16px rgba(232,89,12,0.25)",
          }}
        >
          <Plus className="h-4 w-4" /> Report Found
        </Link>
      </div>

      <div className="mb-8 flex gap-2">
        {["All", "Lost", "Found"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium ${tab === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/80 hover:bg-muted"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <div
            key={i.id}
            className="group overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            }}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-2)]">
              <SmartImage
                src={i.image}
                fallbackSeed={`lf-${i.id}`}
                alt={i.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-base font-semibold text-foreground">{i.name}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${i.status === "Lost" ? "bg-primary/10 text-primary" : "bg-[oklch(0.92_0.05_150)] text-[oklch(0.35_0.12_150)]"}`}
                >
                  {i.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{i.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
                <span>📍 {i.location}</span>
                <span>📅 {i.date}</span>
                <span>🎓 {i.college}</span>
                <span>{i.department}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
