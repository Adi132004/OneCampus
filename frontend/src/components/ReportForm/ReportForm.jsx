import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PageShell } from "../PageShell";
import { createLostFoundItem } from "@/lib/lostFoundApi";
import { getCurrentAuthUser, subscribeToAuth } from "@/lib/firebase";

export function ReportForm({ kind, onDone }) {
  const nav = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    date: "",
    contact: "",
    image: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(() => Boolean(getCurrentAuthUser()));

  useEffect(() => subscribeToAuth((user) => setIsSignedIn(Boolean(user))), []);

  useEffect(() => {
    if (!isSignedIn) {
      nav({ to: "/login" });
    }
  }, [isSignedIn, nav]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isSignedIn) {
      setError("Please sign in before submitting a lost or found report.");
      return;
    }

    if (!formData.name.trim() || !formData.description.trim() || !formData.location.trim() || !formData.date || !formData.contact.trim()) {
      setError("Please fill in every field so the report is useful.");
      return;
    }

    const currentUser = getCurrentAuthUser();
    const newItem = {
      id: `${kind}-${Date.now()}`,
      name: formData.name.trim(),
      emoji: kind === "lost" ? "🧳" : "✅",
      image: "",
      description: formData.description.trim(),
      location: formData.location.trim(),
      date: formData.date,
      contact: formData.contact.trim(),
      college: "Your campus",
      status: kind === "lost" ? "Lost" : "Found",
      owner: currentUser
        ? {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
          }
        : null,
    };

    try {
      await createLostFoundItem({
        name: newItem.name,
        description: newItem.description,
        status: newItem.status,
        location: newItem.location,
        date: newItem.date,
        contact: newItem.contact,
        emoji: newItem.emoji,
        image: formData.image || "",
      });
      setSuccessMessage("Report created successfully. Redirecting...");
      setTimeout(() => onDone?.(newItem), 1400);
    } catch (err) {
      const msg = (err && err.message) || "";
      if (msg === "UNAUTHORIZED" || msg.toLowerCase().includes("401") || msg.toLowerCase().includes("unauthorized")) {
        setError("Session expired — please sign in again.");
        setTimeout(() => nav({ to: "/login" }), 1000);
        return;
      }
      setError(err.message || "Unable to submit the report. Please try again.");
    }
  }

  const label = kind === "lost" ? "Lost Item" : "Found Item";

  if (!isSignedIn) {
    return null;
  }

  return (
    <PageShell
      eyebrow="Lost & Found"
      title={`Report a ${kind} item`}
      subtitle="Add as much detail as possible — it helps others identify it."
    >
      <form className="grid gap-6 lg:grid-cols-[1.2fr_1fr]" onSubmit={handleSubmit}>
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="text-sm font-medium text-foreground">Item details</div>
          <p className="mt-1 text-xs text-muted-foreground">
            No image is required. If none is provided, a simple placeholder will be shown.
          </p>
          <div className="mt-5 rounded-3xl border border-dashed border-border bg-[var(--surface-2)] p-6 text-center text-sm text-muted-foreground">
            Add the item details and we’ll list it without needing a photo.
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="grid gap-4">
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Field
              label={`${label} name`}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Black backpack"
            />
            <Field
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              textarea
              placeholder="Color, brand, distinguishing marks…"
            />
            <Field
              label={kind === "lost" ? "Last seen location" : "Found location"}
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Central Library, 2nd floor"
            />
            <Field label="Date" name="date" value={formData.date} onChange={handleChange} type="date" />
            <Field
              label="Contact details"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Phone or email"
            />
            <Field
              label="Photo URL"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
            />
            {formData.image ? (
              <p className="text-xs text-muted-foreground">
                This photo URL will show on your item card if valid.
              </p>
            ) : null}
            {successMessage ? <p className="text-sm text-green-600">{successMessage}</p> : null}
            <button
              type="submit"
              className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
              style={{
                boxShadow: "0 6px 16px rgba(232,89,12,0.25)",
              }}
            >
              Submit report
            </button>
          </div>
        </div>
      </form>
    </PageShell>
  );
}

function Field({ label, type = "text", placeholder, textarea = false, name, value, onChange }) {
  const cls =
    "w-full rounded-2xl border border-border bg-[var(--surface-2)] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {textarea ? (
        <textarea
          rows={3}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cls}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cls.replace("rounded-2xl", "rounded-full")}
        />
      )}
    </label>
  );
}
