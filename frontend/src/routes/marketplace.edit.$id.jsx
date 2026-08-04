import { createFileRoute } from "@tanstack/react-router";
import { MarketplaceSellPage } from "@/pages/MarketplaceSell";

export const Route = createFileRoute("/marketplace/edit/$id")({
  head: () => ({
    meta: [
      {
        title: "Edit Listing — oneCampus",
      },
    ],
  }),
  component: MarketplaceEditRoute,
});

function MarketplaceEditRoute() {
  const { id } = Route.useParams();
  return <MarketplaceSellPage editMode={true} itemId={id} />;
}
