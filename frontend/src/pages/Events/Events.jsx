import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Calendar, MapPin, Plus, Search, Users } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { fetchEvents } from "@/lib/eventsApi";
import { fetchLostFoundItems } from "@/lib/lostFoundApi";
import { getCurrentAuthUser, subscribeToAuth } from "@/lib/firebase";

export function EventsPage() {
  const [tab, setTab] = useState("Events");
  const [q, setQ] = useState("");
  const [events, setEvents] = useState([]);
  const [lostFoundItems, setLostFoundItems] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => subscribeToAuth((user) => setIsSignedIn(Boolean(user))), []);

  useEffect(() => {
    fetchEvents()
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    if (tab === "Lost & Found") {
      fetchLostFoundItems()
        .then((data) => setLostFoundItems(Array.isArray(data) ? data : []))
        .catch(() => setLostFoundItems([]));
    }
  }, [tab]);

  const visibleEvents = useMemo(() => {
    const filtered = events.filter((e) => e.title.toLowerCase().includes(q.toLowerCase()));
    return filtered.sort((a, b) => {
      const aDate = new Date(a.date || 0).getTime();
      const bDate = new Date(b.date || 0).getTime();
      return bDate - aDate;
    });
  }, [events, q]);

  const visibleLostFound = useMemo(() => {
    return lostFoundItems.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));
  }, [lostFoundItems, q]);

  function formatEventDate(dateStr) {
    if (!dateStr) return "Date TBD";
    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <PageShell
      eyebrow="Events"
      title="Discover and host campus events"
      subtitle="Workshops, fests, meetups, and more — all in one place."
    >
      <div className="mb-6 flex flex-wrap items-center gap-3 md:flex-nowrap md:items-center md:justify-between">
        <div className="relative flex-1 min-w-[240px] md:mr-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tab === "Events" ? "Search events…" : "Search items…"}
            className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {tab === "Events" && (
          <Link
            to={
              isSignedIn ? "/events/create" : `/login?next=${encodeURIComponent("/events/create")}`
            }
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
            style={{ boxShadow: "0 6px 16px rgba(232,89,12,0.25)" }}
          >
            <Plus className="h-4 w-4" /> Create Event
          </Link>
        )}
      </div>

      {tab === "Events" && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleEvents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
              {q ? "No events match your search." : "No events yet. Create the first one!"}
            </div>
          ) : (
            visibleEvents.map((ev) => (
              <div
                key={ev.id}
                className="group overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
              >
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,rgba(232,89,12,0.14),rgba(15,23,42,0.06))]">
                  <div className="text-center">
                    <div className="text-5xl">🎉</div>
                    <div className="mt-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                      Campus Event
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {ev.title}
                      </h3>
                      {ev.organizerName && (
                        <div className="text-sm text-muted-foreground">by {ev.organizerName}</div>
                      )}
                    </div>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Upcoming
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {ev.description}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {formatEventDate(ev.date)}
                    </span>
                    {ev.time && (
                      <span className="inline-flex items-center gap-1">🕐 {ev.time}</span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {ev.location || "TBD"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" /> {ev.college || "Open"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "Lost & Found" && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleLostFound.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
              No items match that search yet. Try a broader keyword or report a new item.
            </div>
          ) : (
            visibleLostFound.map((i) => (
              <div
                key={i.id}
                className="group overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
              >
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,rgba(232,89,12,0.14),rgba(15,23,42,0.06))]">
                  {i.image ? (
                    <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl">{i.emoji || "🧾"}</div>
                      <div className="mt-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                        No image added
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {i.name}
                      </h3>
                      {i.ownerName && (
                        <div className="text-sm text-muted-foreground">by {i.ownerName}</div>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${i.status === "Lost" ? "bg-primary/10 text-primary" : "bg-[oklch(0.92_0.05_150)] text-[oklch(0.35_0.12_150)]"}`}
                    >
                      {i.status}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{i.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
                    <span>📍 {i.location}</span>
                    <span>📅 {i.date}</span>
                    <span>🎓 {i.college}</span>
                    <span>{i.contact ? `📞 ${i.contact}` : "Open"}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </PageShell>
  );
}
