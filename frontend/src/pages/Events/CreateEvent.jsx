import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { createEvent } from "@/lib/eventsApi";
import { getCurrentAuthUser } from "@/lib/firebase";

export function CreateEventPage() {
  const nav = useNavigate();
  const user = getCurrentAuthUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [college, setCollege] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user && typeof window !== "undefined") {
    window.location.href = `/login?next=${encodeURIComponent("/events/create")}`;
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!user?.uid) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      location: location.trim(),
      college: college.trim() || user.campusName || "",
      organizerId: user.uid,
      organizerName: user.displayName || user.email || "Anonymous",
    };

    setIsSubmitting(true);
    setError("");

    try {
      await createEvent(payload);
      nav({ to: "/events" });
    } catch (err) {
      const msg = err?.message || "";
      if (msg === "UNAUTHORIZED") {
        window.location.href = `/login?next=${encodeURIComponent("/events/create")}`;
        return;
      }
      setError(err.message || "Unable to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell
      eyebrow="Events"
      title="Create an event"
      subtitle="Share the details and let your campus know."
    >
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
        <div className="grid gap-5 rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <Field
            label="Event title"
            value={title}
            onChange={setTitle}
            placeholder="e.g. Hackathon 2025"
            required
          />
          <Field
            label="Description"
            value={description}
            onChange={setDescription}
            textarea
            placeholder="What's the event about?"
          />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date" type="date" value={date} onChange={setDate} required />
            <Field label="Time" type="time" value={time} onChange={setTime} />
          </div>
          <Field
            label="Location"
            value={location}
            onChange={setLocation}
            placeholder="e.g. Auditorium"
            required
          />
          <Field
            label="College / Campus"
            value={college}
            onChange={setCollege}
            placeholder="e.g. IIT Bombay"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            style={{ boxShadow: "0 6px 16px rgba(232,89,12,0.25)" }}
          >
            {isSubmitting ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </PageShell>
  );
}

function Field({ label, type = "text", placeholder, textarea = false, value, onChange, required }) {
  const cls =
    "w-full rounded-2xl border border-border bg-[var(--surface-2)] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {textarea ? (
        <textarea
          rows={4}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      )}
    </label>
  );
}
