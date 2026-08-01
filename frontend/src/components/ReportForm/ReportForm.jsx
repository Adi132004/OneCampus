import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { UploadCloud, Check } from "lucide-react";
import { PageShell } from "../PageShell";
import { createLostFoundItemWithFile } from "@/lib/lostFoundApi";
import { getCurrentAuthUser, subscribeToAuth } from "@/lib/firebase";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

// ─── Category definitions ──────────────────────────────────────────────────
const CATEGORIES = [
  { label: "Electronics", emoji: "💻" },
  { label: "Documents & IDs", emoji: "📄" },
  { label: "Wallets & Money", emoji: "👛" },
  { label: "Bags & Luggage", emoji: "🎒" },
  { label: "Keys", emoji: "🔑" },
  { label: "Clothing & Accessories", emoji: "👗" },
  { label: "Jewellery", emoji: "💍" },
  { label: "Books & Stationery", emoji: "📚" },
  { label: "Sports Equipment", emoji: "⚽" },
  { label: "Vehicles & Vehicle Accessories", emoji: "🚗" },
  { label: "Gadgets & Accessories", emoji: "🎧" },
  { label: "Personal Items", emoji: "🧴" },
  { label: "Medical Items", emoji: "💊" },
  { label: "Food & Water Containers", emoji: "🍱" },
  { label: "Miscellaneous", emoji: "📦" },
  { label: "Other", emoji: "✏️" },
];

// ─── CategorySelector ──────────────────────────────────────────────────────
function CategorySelector({ value, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Item category"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
        gap: "8px",
      }}
    >
      {CATEGORIES.map((cat) => {
        const isSelected = value === cat.label;
        return (
          <button
            key={cat.label}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(cat.label)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange(cat.label);
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 10px",
              borderRadius: "12px",
              border: isSelected
                ? "2px solid var(--primary)"
                : "1.5px solid var(--border)",
              background: isSelected
                ? "oklch(from var(--primary) l c h / 0.12)"
                : "var(--card)",
              color: isSelected ? "var(--primary)" : "var(--foreground)",
              fontWeight: isSelected ? 600 : 400,
              fontSize: "12px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
              outline: "none",
              position: "relative",
              boxShadow: isSelected
                ? "0 0 0 3px oklch(from var(--primary) l c h / 0.15)"
                : "none",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.background = "var(--muted)";
                e.currentTarget.style.borderColor = "oklch(from var(--primary) l c h / 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.background = "var(--card)";
                e.currentTarget.style.borderColor = "var(--border)";
              }
            }}
          >
            <span style={{ fontSize: "16px", flexShrink: 0 }}>{cat.emoji}</span>
            <span style={{ lineHeight: 1.3, flex: 1 }}>{cat.label}</span>
            {isSelected && (
              <Check
                style={{
                  width: "13px",
                  height: "13px",
                  flexShrink: 0,
                  color: "var(--primary)",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── ReportForm ────────────────────────────────────────────────────────────
export function ReportForm({ kind, onDone }) {
  const nav = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    date: "",
    contact: "",
  });
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(() => Boolean(getCurrentAuthUser()));

  useEffect(() => subscribeToAuth((user) => setIsSignedIn(Boolean(user))), []);

  useEffect(() => {
    if (!isSignedIn) {
      nav({ to: "/login" });
    }
  }, [isSignedIn, nav]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFileSelection(selectedFile) {
    if (!selectedFile) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(selectedFile.type)) {
      setError("Please choose a JPG, JPEG, PNG, or WEBP image.");
      return;
    }
    setFile(selectedFile);
    setError("");
  }

  // Determine the final category string to submit
  function getFinalCategory() {
    if (category === "Other") {
      return customCategory.trim() || "";
    }
    return category;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isSignedIn) {
      setError("Please sign in before submitting a lost or found report.");
      return;
    }

    if (!formData.name.trim() || !formData.description.trim() || !formData.location.trim() || !formData.date || !formData.contact.trim()) {
      setError("Please fill in every required field before submitting.");
      return;
    }

    if (!category) {
      setError("Please select a category for the item.");
      return;
    }

    if (category === "Other" && !customCategory.trim()) {
      setError("Please describe the custom category in the text box.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      await createLostFoundItemWithFile(
        {
          name: formData.name.trim(),
          description: formData.description.trim(),
          status: kind === "lost" ? "Lost" : "Found",
          location: formData.location.trim(),
          date: formData.date,
          contact: formData.contact.trim(),
          emoji: kind === "lost" ? "🧳" : "✅",
          category: getFinalCategory(),
        },
        file || null,
      );
      setSuccessMessage("Report submitted successfully. Redirecting...");
      setTimeout(() => onDone?.(), 1200);
    } catch (err) {
      const msg = (err && err.message) || "";
      if (msg === "UNAUTHORIZED" || msg.toLowerCase().includes("401") || msg.toLowerCase().includes("unauthorized")) {
        setError("Session expired — please sign in again.");
        setTimeout(() => nav({ to: "/login" }), 1000);
        return;
      }
      setError(err.message || "Unable to submit the report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const label = kind === "lost" ? "Lost Item" : "Found Item";
  const placeholderText = useMemo(() => ({
    name: kind === "lost" ? "e.g. iPhone 15, HP Laptop, Gold Ring…" : "e.g. Blue Backpack, Wallet, Keys…",
    description: kind === "lost" ? "Describe your lost item in detail" : "Describe where and how you found it",
    location: kind === "lost" ? "Last seen location" : "Where you found it",
    date: "Select date",
    contact: "Phone number or email",
  }), [kind]);

  if (!isSignedIn) {
    return null;
  }

  return (
    <PageShell
      eyebrow="Lost & Found"
      title={`Report a ${kind} item`}
      subtitle="Share a clear description and optionally add a photo to help others recognize it."
    >
      <form className="grid gap-6" onSubmit={handleSubmit}>

        {/* ── Top row: image + basic fields ── */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Image upload */}
          <div
            role="button"
            tabIndex={0}
            onClick={openFilePicker}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openFilePicker();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              handleFileSelection(event.dataTransfer.files?.[0]);
            }}
            className={`group flex min-h-[280px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-dashed p-6 text-center transition-all duration-300 ${dragActive ? "border-primary bg-primary/10 shadow-lg" : "border-border bg-card hover:-translate-y-1 hover:shadow-lg"}`}
          >
            {previewUrl ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                <img src={previewUrl} alt="Preview" className="max-h-[220px] w-full rounded-2xl object-contain shadow-sm" />
                <p className="text-sm text-muted-foreground">Image ready — will upload when you submit.</p>
              </div>
            ) : (
              <>
                <div className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                  <UploadCloud className="h-9 w-9" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Click to upload image</h3>
                <p className="mt-2 text-sm text-muted-foreground">or Drag &amp; Drop</p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">JPG · JPEG · PNG · WEBP</p>
              </>
            )}
          </div>

          {/* Basic fields */}
          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            <div className="grid gap-4">
              {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
              {successMessage ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p> : null}
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(event) => handleFileSelection(event.target.files?.[0])}
              />
              <Field label={`${label} name`} name="name" value={formData.name} onChange={handleChange} placeholder={placeholderText.name} />
              <Field label="Description" name="description" value={formData.description} onChange={handleChange} textarea placeholder={placeholderText.description} />
              <Field label={kind === "lost" ? "Last seen location" : "Found location"} name="location" value={formData.location} onChange={handleChange} placeholder={placeholderText.location} />
              <Field label="Date" name="date" value={formData.date} onChange={handleChange} type="date" placeholder={placeholderText.date} />
              <Field label="Contact details" name="contact" value={formData.contact} onChange={handleChange} placeholder={placeholderText.contact} />
            </div>
          </div>
        </div>

        {/* ── Category selector ── */}
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Category</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">Required</span>
            {category && category !== "Other" && (
              <span className="ml-auto rounded-full border border-primary/30 bg-primary/8 px-3 py-0.5 text-xs font-medium text-primary">
                {CATEGORIES.find((c) => c.label === category)?.emoji} {category}
              </span>
            )}
          </div>
          <CategorySelector value={category} onChange={(val) => { setCategory(val); if (error) setError(""); }} />
          {category === "Other" && (
            <div className="mt-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  Describe the category <span className="text-primary">*</span>
                </span>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => { setCustomCategory(e.target.value); if (error) setError(""); }}
                  placeholder="e.g. Musical Instrument, Lab Equipment…"
                  maxLength={60}
                  className="w-full rounded-2xl border border-border bg-[var(--surface-2)] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
            </div>
          )}
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          style={{ boxShadow: "0 6px 20px oklch(from var(--primary) l c h / 0.3)" }}
        >
          {isSubmitting ? "Submitting…" : `Submit ${kind === "lost" ? "Lost" : "Found"} Item Report`}
        </button>
      </form>
    </PageShell>
  );
}

// ─── Field helper ──────────────────────────────────────────────────────────
function Field({ label, type = "text", placeholder, textarea = false, name, value, onChange }) {
  const cls = "w-full rounded-2xl border border-border bg-[var(--surface-2)] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {textarea ? (
        <textarea rows={3} name={name} value={value} onChange={onChange} placeholder={placeholder} className={cls} />
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className={cls} />
      )}
    </label>
  );
}
