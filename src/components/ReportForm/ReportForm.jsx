import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { PageShell } from "../PageShell";
export function ReportForm({ kind, onDone }) {
  const [previews, setPreviews] = useState([]);
  function onFiles(files) {
    if (!files) return;
    const urls = Array.from(files)
      .slice(0, 4)
      .map((f) => URL.createObjectURL(f));
    setPreviews((p) => [...p, ...urls].slice(0, 4));
  }
  const label = kind === "lost" ? "Lost Item" : "Found Item";
  return (
    <PageShell
      eyebrow="Lost & Found"
      title={`Report a ${kind} item`}
      subtitle="Add as much detail as possible — it helps others identify it."
    >
      <form
        className="grid gap-6 lg:grid-cols-[1.2fr_1fr]"
        onSubmit={(e) => {
          e.preventDefault();
          onDone();
        }}
      >
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="text-sm font-medium text-foreground">Item photos</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Clear photos help others recognize the item.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {previews.map((src, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-[var(--surface-2)]"
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPreviews((p) => p.filter((_, j) => j !== i))}
                  className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-card/90"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {previews.length < 4 && (
              <label className="grid aspect-square cursor-pointer place-items-center rounded-2xl border border-dashed border-border bg-[var(--surface-2)] text-muted-foreground hover:bg-muted">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onFiles(e.target.files)}
                />
                <div className="flex flex-col items-center gap-1 text-xs">
                  <ImagePlus className="h-5 w-5" /> Upload
                </div>
              </label>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="grid gap-4">
            <Field label={`${label} name`} placeholder="e.g. Black backpack" />
            <Field label="Description" textarea placeholder="Color, brand, distinguishing marks…" />
            <Field
              label={kind === "lost" ? "Last seen location" : "Found location"}
              placeholder="e.g. Central Library, 2nd floor"
            />
            <Field label="Date" type="date" />
            <Field label="Contact details" placeholder="Phone or email" />
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
function Field({ label, type = "text", placeholder, textarea = false }) {
  const cls =
    "w-full rounded-2xl border border-border bg-[var(--surface-2)] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {textarea ? (
        <textarea rows={3} placeholder={placeholder} className={cls} />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          className={cls.replace("rounded-2xl", "rounded-full")}
        />
      )}
    </label>
  );
}
