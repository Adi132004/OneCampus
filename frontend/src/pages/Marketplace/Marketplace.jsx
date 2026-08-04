import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Plus } from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { SmartImage } from "@/components/SmartImage";

import { CATEGORIES } from "@/lib/mock-data";
import { getMarketplaceItems } from "@/services/marketplace";

export function MarketplacePage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [maxPrice, setMaxPrice] = useState(10000);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["marketplace"],
    queryFn: getMarketplaceItems,
  });

  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        (cat === "All" || p.category === cat) &&
        p.price <= maxPrice &&
        p.title.toLowerCase().includes(q.toLowerCase())
    );
  }, [products, q, cat, maxPrice]);

  const featured = filtered.slice(0, 3);

  if (isLoading) {
    return (
      <PageShell
        eyebrow="Marketplace"
        title="Buy & sell on your campus"
        subtitle="Loading marketplace..."
      />
    );
  }

  return (
    <PageShell
      eyebrow="Marketplace"
      title="Buy & sell on your campus"
      subtitle="Verified students. Fair prices. No middlemen."
    >
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <Link
          to="/marketplace/sell"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
          style={{
            boxShadow: "0 6px 16px rgba(232,89,12,0.25)",
          }}
        >
          <Plus className="h-4 w-4" />
          Sell something
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                cat === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground/80 hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" />

          <span>Max price: ₹{maxPrice}</span>

          <input
            type="range"
            min={100}
            max={10000}
            step={100}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="accent-primary"
          />
        </div>
      </div>

      <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
        Featured
      </h2>

      <div className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>

      <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
        Recent listings
      </h2>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </PageShell>
  );
}

export function ProductCard({ p }) {
  return (
    <Link
      to="/marketplace/$id"
      params={{
        id: p.id,
      }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-2)]">
        <SmartImage
          src={p.image}
          fallbackSeed={`market-${p.id}`}
          alt={p.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-foreground/80 backdrop-blur">
          {p.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-foreground line-clamp-1">
            {p.title}
          </h3>

          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            ₹{p.price}
          </span>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {p.sellerName} • {p.college}
        </p>

        <p className="mt-3 text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
          {new Date(p.createdAt).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-card p-16 text-center">
      <div className="text-5xl">🛒</div>

      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
        No listings match your filters
      </h3>

      <p className="mt-1 text-sm text-muted-foreground">
        Try widening the price range or picking a different category.
      </p>
    </div>
  );
}