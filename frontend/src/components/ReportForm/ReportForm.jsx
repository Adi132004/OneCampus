import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { UploadCloud } from "lucide-react";
import { PageShell } from "../PageShell";
import { createLostFoundItemWithFile } from "@/lib/lostFoundApi";
import { getCurrentAuthUser, subscribeToAuth } from "@/lib/firebase";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

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
    name: "Enter lost item name",
    description: "Describe your lost item",
    location: "Enter last seen location",
    date: "Select date",
    contact: "Enter phone number or email",
  }), []);

  if (!isSignedIn) {
    return null;
  }

  return (
    <PageShell
      eyebrow="Lost & Found"
      title={`Report a ${kind} item`}
      subtitle="Share a clear description and optionally add a photo to help others recognize it."
    >
      <form className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]" onSubmit={handleSubmit}>
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
          className={`group flex min-h-[340px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-dashed p-6 text-center transition-all duration-300 ${dragActive ? "border-primary bg-primary/10 shadow-lg" : "border-border bg-card hover:-translate-y-1 hover:shadow-lg"}`}
        >
          {previewUrl ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3">
              <img src={previewUrl} alt="Preview" className="max-h-[260px] w-full rounded-2xl object-contain shadow-sm" />
              <p className="text-sm text-muted-foreground">Image ready to upload when you submit the report.</p>
            </div>
          ) : (
            <>
              <div className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                <UploadCloud className="h-9 w-9" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Click to upload image</h3>
              <p className="mt-2 text-sm text-muted-foreground">or Drag & Drop</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">JPG, JPEG, PNG, WEBP</p>
            </>
          )}
        </div>

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
            <button type="submit" disabled={isSubmitting} className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? "Submitting..." : "Submit report"}
            </button>
          </div>
        </div>
      </form>
    </PageShell>
  );
}

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
