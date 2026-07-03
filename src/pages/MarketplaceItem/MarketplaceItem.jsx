import { Link, notFound } from "@tanstack/react-router";
import { MessageCircle, Phone } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SmartImage } from "@/components/SmartImage";
import { PRODUCTS } from "@/lib/mock-data";

export function MarketplaceItemPage() {
  const { id } = Route.useParams();
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) throw notFound();
  return (
    <PageShell>
      <div className="mb-6 pt-10">
        <Link to="/marketplace" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to marketplace
        </Link>
      </div>
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-3xl border border-border bg-[var(--surface-2)]">
            <SmartImage
              src={p.image}
              fallbackSeed={`market-hero-${p.id}`}
              alt={p.title}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[p.image, p.image, p.image, p.image].map((src, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
                <SmartImage
                  src={src}
                  fallbackSeed={`market-thumb-${p.id}-${i}`}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            {p.category} • {p.condition}
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
            {p.title}
          </h1>
          <div className="mt-3 text-3xl font-display font-bold text-primary">₹{p.price}</div>
          <p className="mt-5 text-muted-foreground">{p.description}</p>

          <div className="mt-8 rounded-3xl border border-border bg-card p-5">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Seller
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 font-display font-semibold text-primary">
                {p.seller[0]}
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{p.seller}</div>
                <div className="text-xs text-muted-foreground">
                  {p.college} • {p.department}
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Link
                to="/chat"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" /> Chat
              </Link>
              <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
                <Phone className="h-4 w-4" /> Contact
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground font-mono uppercase tracking-wider">
            Posted {p.postedAt}
          </p>
        </div>
      </div>
    </PageShell>
  );
}
