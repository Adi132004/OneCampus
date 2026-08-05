import { Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Pencil, Trash2 } from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { SmartImage } from "@/components/SmartImage";

import { Route } from "@/routes/marketplace.$id";
import {
  getMarketplaceItem,
  deleteMarketplaceItem,
} from "@/services/marketplace";

import { useState, useEffect } from "react";
import { getCurrentAuthUser, subscribeToAuth } from "@/lib/firebase";

export function MarketplaceItemPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsub = subscribeToAuth(setCurrentUser);
    return () => unsub();
  }, []);

  const {
    data: p,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["marketplace-item", id],
    queryFn: () => getMarketplaceItem(id),
  });

  if (isLoading) {
    return (
      <PageShell>
        <div className="py-20 text-center text-lg font-medium">
          Loading product...
        </div>
      </PageShell>
    );
  }

  if (isError || !p) {
    throw notFound();
  }

  const isOwner = currentUser && currentUser.uid === p.sellerId;

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing?"
    );

    if (!confirmed) return;

    try {
      await deleteMarketplaceItem(p.id);
      alert("Listing deleted successfully!");

      await queryClient.invalidateQueries({
        queryKey: ["marketplace"],
      });

      navigate({
        to: "/marketplace",
      });
    } catch (err) {
      alert(err.message || "Failed to delete listing.");
    }
  }

  return (
    <PageShell>
      <div className="mb-6 pt-6">
        <Link
          to="/marketplace"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to marketplace
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* LEFT SIDE: Image Gallery */}
        <div>
          <div className="overflow-hidden rounded-3xl border border-border bg-[var(--surface-2)] shadow-sm">
            <SmartImage
              src={p.image}
              fallbackSeed={`market-hero-${p.id}`}
              alt={p.title}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>

        {/* RIGHT SIDE: Product Info */}
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            {p.category} • {p.condition}
          </div>

          <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
            {p.title}
          </h1>

          <div className="mt-3 text-3xl font-display font-bold text-primary">
            ₹{Number(p.price).toLocaleString("en-IN")}
          </div>

          <p className="mt-5 text-muted-foreground leading-relaxed">
            {p.description}
          </p>

          <div className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Seller Information
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 font-display font-semibold text-primary text-base">
                {p.sellerName?.charAt(0) || "U"}
              </div>

              <div>
                <div className="text-sm font-medium text-foreground">
                  {p.sellerName}
                </div>

                {p.college && (
                  <div className="text-xs text-muted-foreground">
                    {p.college}
                  </div>
                )}

                {p.sellerEmail && (
                  <div className="text-xs text-muted-foreground">
                    {p.sellerEmail}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5">
              <Link
                to="/chat"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="h-4 w-4" />
                Chat with Seller
              </Link>
            </div>

            {isOwner && (
              <div className="mt-4 flex gap-3 pt-2 border-t border-border">
                <button
                  onClick={() => {
                    navigate({
                      to: "/marketplace/edit/$id",
                      params: {
                        id: p.id,
                      },
                    });
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>

                <button
                  onClick={handleDelete}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>

          <p className="mt-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Posted {new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>
    </PageShell>
  );
}