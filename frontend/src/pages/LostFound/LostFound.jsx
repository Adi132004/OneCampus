import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Edit3, Plus, Search, Trash2, X } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { deleteLostFoundItem, fetchLostFoundItems, updateLostFoundItem } from "@/lib/lostFoundApi";
import { getCurrentAuthUser, subscribeToAuth } from "@/lib/firebase";

export function LostFoundPage() {
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(() => Boolean(getCurrentAuthUser()));
  const [editingItem, setEditingItem] = useState(null);
  const [draft, setDraft] = useState({ name: "", description: "", location: "", date: "", contact: "" });

  useEffect(() => subscribeToAuth((user) => setIsSignedIn(Boolean(user))), []);

  useEffect(() => {
    fetchLostFoundItems()
      .then((items) => setItems(items))
      .catch((err) => {
        const msg = (err && err.message) || "";
        if (msg === "UNAUTHORIZED" || msg.toLowerCase().includes("401") || msg.toLowerCase().includes("unauthorized")) {
          // redirect to login preserving next
          window.location.href = `/login?next=${encodeURIComponent("/lost-found")}`;
          return;
        }
        setItems([]);
      });
  }, []);

  const currentUser = getCurrentAuthUser();
  const currentUserEmail = currentUser?.email || null;

  const visibleItems = useMemo(() => {
    const filtered = items.filter(
      (i) => (tab === "All" || i.status === tab) && i.name.toLowerCase().includes(q.toLowerCase()),
    );

    return filtered.sort((a, b) => {
      const aDate = new Date(a.date || 0).getTime();
      const bDate = new Date(b.date || 0).getTime();
      return bDate - aDate;
    });
  }, [items, q, tab]);

  function handleDelete(itemId) {
    deleteLostFoundItem(itemId);
    setItems((current) => current.filter((item) => item.id !== itemId));
  }

  function startEdit(item) {
    setEditingItem(item);
    setDraft({
      name: item.name || "",
      description: item.description || "",
      location: item.location || "",
      date: item.date || "",
      contact: item.contact || "",
    });
  }

  function cancelEdit() {
    setEditingItem(null);
    setDraft({ name: "", description: "", location: "", date: "", contact: "" });
  }

  function saveEdit(event) {
    event.preventDefault();
    if (!editingItem) return;

    const nextItem = {
      ...editingItem,
      name: draft.name.trim() || editingItem.name,
      description: draft.description.trim() || editingItem.description,
      location: draft.location.trim() || editingItem.location,
      date: draft.date || editingItem.date,
      contact: draft.contact.trim() || editingItem.contact,
    };

    updateLostFoundItem(editingItem.id, nextItem);
    setItems((current) => current.map((item) => (item.id === editingItem.id ? { ...item, ...nextItem } : item)));
    cancelEdit();
  }

  function canManage(item) {
    if (!currentUserEmail) return false;
    // backend items expose ownerEmail and ownerId fields
    return item.ownerEmail === currentUserEmail;
  }

  return (
    <PageShell
      eyebrow="Lost & Found"
      title="Reunite items with their owners"
      subtitle="Browse recent reports or post your own."
    >
      <div className="mb-6 flex flex-wrap items-center gap-3 md:flex-nowrap md:items-center md:justify-between">
        <div className="relative flex-1 min-w-[240px] md:mr-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search items…"
            className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-3">
          <Link
            to={isSignedIn ? "/lost-found/report-lost" : `/login?next=${encodeURIComponent("/lost-found/report-lost")}`}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Plus className="h-4 w-4" /> Report Lost
          </Link>
          <Link
            to={isSignedIn ? "/lost-found/report-found" : `/login?next=${encodeURIComponent("/lost-found/report-found")}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
            style={{
              boxShadow: "0 6px 16px rgba(232,89,12,0.25)",
            }}
          >
            <Plus className="h-4 w-4" /> Report Found
          </Link>
        </div>
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
        {visibleItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
            No items match that search yet. Try a broader keyword or report a new item.
          </div>
        ) : (
          visibleItems.map((i) => (
            <div
              key={i.id}
              className="group overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              }}
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
                  <h3 className="font-display text-base font-semibold text-foreground">{i.name}</h3>
                  {i.ownerName ? (
                    <div className={`text-sm ${i.ownerEmail === currentUserEmail ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                      by {i.ownerName}
                    </div>
                  ) : null}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${i.status === "Lost" ? "bg-primary/10 text-primary" : "bg-[oklch(0.92_0.05_150)] text-[oklch(0.35_0.12_150)]"}`}
                >
                  {i.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{i.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
                <span>📍 {i.location}</span>
                <span>📅 {formatLostItemDate(i.date)}</span>
                <span>🎓 {i.college}</span>
                <span>{i.contact ? `📞 ${i.contact}` : "Open"}</span>
              </div>
              {canManage(i) ? (
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(i)}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(i.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-destructive/20 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          ))
        )}
      {editingItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Edit report</h3>
              <button type="button" onClick={cancelEdit} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={saveEdit} className="grid gap-4">
              <label className="block text-sm font-medium text-foreground">
                <span className="mb-1.5 block">Item name</span>
                <input
                  value={draft.name}
                  onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-full border border-border bg-[var(--surface-2)] px-4 py-2.5 text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                <span className="mb-1.5 block">Description</span>
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full rounded-2xl border border-border bg-[var(--surface-2)] px-4 py-2.5 text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                <span className="mb-1.5 block">Location</span>
                <input
                  value={draft.location}
                  onChange={(event) => setDraft((prev) => ({ ...prev, location: event.target.value }))}
                  className="w-full rounded-full border border-border bg-[var(--surface-2)] px-4 py-2.5 text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                <span className="mb-1.5 block">Date</span>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))}
                  className="w-full rounded-full border border-border bg-[var(--surface-2)] px-4 py-2.5 text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                <span className="mb-1.5 block">Contact</span>
                <input
                  value={draft.contact}
                  onChange={(event) => setDraft((prev) => ({ ...prev, contact: event.target.value }))}
                  className="w-full rounded-full border border-border bg-[var(--surface-2)] px-4 py-2.5 text-sm"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={cancelEdit} className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground">
                  Cancel
                </button>
                <button type="submit" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      </div>
    </PageShell>
  );
}
