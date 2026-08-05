import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Edit3, MessageCircle, Plus, RefreshCw, Search, Trash2, UploadCloud, X } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SmartImage } from "@/components/SmartImage";
import { deleteLostFoundItem, fetchLostFoundItems, updateLostFoundItem, updateLostFoundItemWithFile, repostLostFoundItem } from "@/lib/lostFoundApi";
import { getCurrentAuthUser, subscribeToAuth, API_BASE_URL } from "@/lib/firebase";
import { formatLostItemDate } from "@/lib/mock-data";

export function LostFoundPage() {
  const nav = useNavigate();
  const editFileInputRef = useRef(null);
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [draft, setDraft] = useState({ name: "", description: "", location: "", date: "", contact: "", category: "" });
  const [editFile, setEditFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [editError, setEditError] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [chattingWith, setChattingWith] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [repostingId, setRepostingId] = useState(null);

  useEffect(() => {
    const stored = getCurrentAuthUser();
    setIsSignedIn(Boolean(stored));
    setCurrentUser(stored);
    setAuthResolved(true);

    const unsubscribe = subscribeToAuth((user) => {
      setIsSignedIn(Boolean(user));
      setCurrentUser(user);
      setAuthResolved(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchLostFoundItems()
      .then((items) => setItems(items))
      .catch((err) => {
        const msg = (err && err.message) || "";
        if (msg === "UNAUTHORIZED" || msg.toLowerCase().includes("401") || msg.toLowerCase().includes("unauthorized")) {
          if (isSignedIn) {
            // only force login if the user appears signed in but the token is invalid
            window.location.href = `/login?next=${encodeURIComponent("/lost-found")}`;
            return;
          }
          setItems([]);
          return;
        }
        setItems([]);
      });
  }, [isSignedIn]);

  /**
   * Returns true if the logged-in user owns this item.
   */
  function canManage(item) {
    if (!currentUser?.uid) return false;
    return String(item.ownerId) === String(currentUser.uid);
  }

  const visibleItems = useMemo(() => {
    const lq = q.toLowerCase();
    const filtered = items.filter((i) => {
      const matchesQuery =
        (i.name || "").toLowerCase().includes(lq) ||
        (i.description || "").toLowerCase().includes(lq) ||
        (i.location || "").toLowerCase().includes(lq);
      if (!matchesQuery) return false;
      if (tab === "All") return true;
      if (tab === "My Posts") return canManage(i);
      return i.status === tab;
    });

    return filtered.sort((a, b) => {
      const aDate = new Date(a.date || 0).getTime();
      const bDate = new Date(b.date || 0).getTime();
      return bDate - aDate;
    });
  }, [items, q, tab, currentUser?.uid]);

  async function handleDelete(itemId) {
    try {
      await deleteLostFoundItem(itemId);
      // Only remove from local state AFTER the backend confirms deletion
      setItems((current) => current.filter((item) => item.id !== itemId));
    } catch (err) {
      const msg = err?.message || "";
      if (msg === "UNAUTHORIZED") {
        window.location.href = `/login?next=${encodeURIComponent("/lost-found")}`;
        return;
      }
      if (msg === "FORBIDDEN") {
        window.alert("You do not have permission to delete this item.");
        return;
      }
      window.alert(err.message || "Unable to delete item. Please try again.");
    }
  }

  function startEdit(item) {
    setEditingItem(item);
    setDraft({
      name: item.name || "",
      description: item.description || "",
      location: item.location || "",
      date: item.date || "",
      contact: item.contact || "",
      category: item.category || "",
    });
    setEditFile(null);
    setEditPreviewUrl(item.image || item.imageUrl || "");
    setRemoveImage(false);
    setEditError("");
  }

  function cancelEdit() {
    if (editPreviewUrl && editFile) {
      URL.revokeObjectURL(editPreviewUrl);
    }
    setEditingItem(null);
    setEditFile(null);
    setEditPreviewUrl("");
    setRemoveImage(false);
    setEditError("");
    setDraft({ name: "", description: "", location: "", date: "", contact: "", category: "" });
  }

  function handleEditFileSelection(selectedFile) {
    if (!selectedFile) return;
    const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      setEditError("Please choose a JPG, JPEG, PNG, or WEBP image.");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setEditError("Image file size must be less than 5 MB.");
      return;
    }
    setEditFile(selectedFile);
    const newPreview = URL.createObjectURL(selectedFile);
    setEditPreviewUrl(newPreview);
    setRemoveImage(false);
    setEditError("");
  }

  function handleRemoveImage() {
    setEditFile(null);
    setEditPreviewUrl("");
    setRemoveImage(true);
    setEditError("");
  }

  async function saveEdit(event) {
    event.preventDefault();
    if (!editingItem) return;

    const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (editFile) {
      if (!ACCEPTED_TYPES.includes(editFile.type)) {
        setEditError("Please choose a JPG, JPEG, PNG, or WEBP image.");
        return;
      }
      if (editFile.size > 5 * 1024 * 1024) {
        setEditError("Image file size must be less than 5 MB.");
        return;
      }
    }

    const nextPayload = {
      name: draft.name.trim() || editingItem.name,
      description: draft.description.trim() || editingItem.description,
      status: editingItem.status,
      location: draft.location.trim() || editingItem.location,
      date: draft.date || editingItem.date,
      contact: draft.contact.trim() || editingItem.contact,
      emoji: editingItem.emoji,
      category: draft.category || editingItem.category,
      removeImage: removeImage,
      image: removeImage ? null : (editFile ? null : (editingItem.image || editingItem.imageUrl || null)),
    };

    setIsSavingEdit(true);
    setEditError("");

    try {
      let updated;
      if (editFile) {
        updated = await updateLostFoundItemWithFile(editingItem.id, nextPayload, editFile);
      } else {
        updated = await updateLostFoundItem(editingItem.id, nextPayload);
      }
      // Only update local state AFTER the backend confirms the update
      setItems((current) =>
        current.map((item) => (item.id === editingItem.id ? { ...item, ...updated } : item)),
      );
      cancelEdit();
    } catch (err) {
      const msg = err?.message || "";
      if (msg === "UNAUTHORIZED") {
        window.location.href = `/login?next=${encodeURIComponent("/lost-found")}`;
        return;
      }
      if (msg === "FORBIDDEN") {
        setEditError("You do not have permission to edit this item.");
        return;
      }
      setEditError(err.message || "Unable to save changes. Please try again.");
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleRepost(item, targetStatus) {
    const statusToUse = targetStatus || item.status || "Lost";
    setRepostingId(item.id);
    try {
      const updated = await repostLostFoundItem(item.id, statusToUse);
      setItems((current) =>
        current.map((i) => (i.id === item.id ? { ...i, ...updated } : i)),
      );
    } catch (err) {
      const msg = err?.message || "";
      if (msg === "UNAUTHORIZED") {
        window.location.href = `/login?next=${encodeURIComponent("/lost-found")}`;
        return;
      }
      if (msg === "FORBIDDEN") {
        window.alert("You do not have permission to repost this item.");
        return;
      }
      window.alert(err.message || "Unable to repost item. Please try again.");
    } finally {
      setRepostingId(null);
    }
  }

  async function startChat(item) {
    if (!isSignedIn) {
      window.location.href = `/login?next=${encodeURIComponent("/lost-found")}`;
      return;
    }
    setChatLoading(true);
    setChattingWith(item.id);
    try {
      const token = currentUser?.accessToken || localStorage.getItem("onecampus-access-token");
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ lostReportId: item.id, otherUserId: item.ownerId }),
      });
      if (!response.ok) {
        throw new Error("Unable to open chat right now.");
      }
      const conversation = await response.json();
      nav({ to: `/chat?conversation=${conversation.id}` });
    } catch (error) {
      setChattingWith(null);
      window.alert(error.message || "Unable to open chat.");
    } finally {
      setChatLoading(false);
    }
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
      </div>

      <div className="mb-8 flex gap-2">
        {["All", "Lost", "Found", "My Posts"].map((t) => (
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
              {i.image || i.imageUrl ? (
                <SmartImage
                  src={i.image || i.imageUrl}
                  fallbackSeed={i.id}
                  alt={i.name}
                  className="h-full w-full object-cover"
                />
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
                  {i.category ? (
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {i.category}
                    </div>
                  ) : null}
                  {i.ownerName ? (
                    <div className={`mt-1 text-sm ${canManage(i) ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                      by {i.ownerName}
                    </div>
                  ) : null}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${i.status === "Lost" ? "bg-primary/10 text-primary" : "bg-[oklch(0.92_0.05_150)] text-[oklch(0.35_0.12_150)]"}`}>
                  {i.status}
                </span>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{i.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
                <span>📍 {i.location}</span>
                <span>📅 {formatLostItemDate(i.date)}</span>
                <span>🎓 {i.college}</span>
                <span>{i.contact ? `📞 ${i.contact}` : "Open"}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                  View Details
                </button>
                {!canManage(i) ? (
                  <button type="button" onClick={() => startChat(i)} disabled={chatLoading && chattingWith === i.id} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-70">
                    <MessageCircle className="h-3.5 w-3.5" /> {chatLoading && chattingWith === i.id ? "Opening..." : "Message"}
                  </button>
                ) : null}
              </div>
              {canManage(i) ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleRepost(i, i.status === "Found" ? "Found" : "Lost")}
                    disabled={repostingId === i.id}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${repostingId === i.id ? "animate-spin" : ""}`} />
                    {repostingId === i.id
                      ? "Reposting..."
                      : i.status === "Found"
                      ? "Repost Found"
                      : "Repost Lost"}
                  </button>
                  <button type="button" onClick={() => startEdit(i)} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(i.id)} className="inline-flex items-center gap-1 rounded-full border border-destructive/20 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          ))
        )}
      {editingItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-xl my-8 rounded-3xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Edit report</h3>
              <button type="button" onClick={cancelEdit} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            {editError ? (
              <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{editError}</p>
            ) : null}
            <form onSubmit={saveEdit} className="grid gap-4">
              {/* Hidden file input for image edit */}
              <input
                ref={editFileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(event) => handleEditFileSelection(event.target.files?.[0])}
              />

              {/* Image Upload / Preview Section */}
              <div className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">Item Image</span>
                {editPreviewUrl ? (
                  <div className="relative flex flex-col items-center gap-2 rounded-2xl border border-border bg-muted/30 p-3">
                    <img src={editPreviewUrl} alt="Preview" className="max-h-[180px] w-full rounded-xl object-contain" />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                      >
                        <UploadCloud className="h-3.5 w-3.5" /> Change Image
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="inline-flex items-center gap-1 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => editFileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        editFileInputRef.current?.click();
                      }
                    }}
                    className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-center hover:bg-muted/40"
                  >
                    <UploadCloud className="mb-2 h-7 w-7 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Click to upload new image</span>
                    <span className="mt-1 text-xs text-muted-foreground">JPG, JPEG, PNG, WEBP (Max 5 MB)</span>
                  </div>
                )}
              </div>

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
              <label className="block text-sm font-medium text-foreground">
                <span className="mb-1.5 block">Category</span>
                <input
                  value={draft.category}
                  onChange={(event) => setDraft((prev) => ({ ...prev, category: event.target.value }))}
                  placeholder="e.g. Electronics, Keys…"
                  className="w-full rounded-full border border-border bg-[var(--surface-2)] px-4 py-2.5 text-sm"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={cancelEdit} className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground">
                  Cancel
                </button>
                <button type="submit" disabled={isSavingEdit} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
                  {isSavingEdit ? "Saving..." : "Save changes"}
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
