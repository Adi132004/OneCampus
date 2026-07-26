import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { CATEGORIES } from "@/lib/mock-data";

export function MarketplaceSellPage() {
  const navigate = useNavigate();
  const [previews, setPreviews] = useState([]);
  function onFiles(files) {
    if (!files) return;
    const urls = Array.from(files)
      .slice(0, 5)
      .map((f) => URL.createObjectURL(f));
    setPreviews((p) => [...p, ...urls].slice(0, 5));
  }
  return (
    <PageShell
      eyebrow="Marketplace"
      title="Sell something"
      subtitle="Reach students from your campus instantly."
    >
      <form
        className="grid gap-6 lg:grid-cols-[1.2fr_1fr]"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({
            to: "/marketplace",
          });
        }}
      >
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="text-sm font-medium text-foreground">Product images</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Up to 5 photos. First one becomes the cover.
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
                  className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-card/90 text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {previews.length < 5 && (
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
            <Field label="Product name" placeholder="e.g. DSA Textbook" />
            <Field label="Description" placeholder="Describe condition, age, etc." textarea />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price (₹)" type="number" placeholder="450" />
              <Select label="Condition" options={["New", "Like new", "Good", "Used"]} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Category" options={CATEGORIES.filter((c) => c !== "All")} />
              <Field label="Contact (phone/email)" placeholder="you@college.edu" />
            </div>
            <button
              type="submit"
              className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
              style={{
                boxShadow: "0 6px 16px rgba(232,89,12,0.25)",
              }}
            >
              Publish listing
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
        <textarea rows={4} placeholder={placeholder} className={cls} />
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
function Select({ label, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <select className="w-full rounded-full border border-border bg-[var(--surface-2)] px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
