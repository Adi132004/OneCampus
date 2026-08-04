import { createFileRoute } from "@tanstack/react-router";
import { MarketplaceItemPage } from "@/pages/MarketplaceItem";

export const Route = createFileRoute("/marketplace/$id")({
  head: () => ({
    meta: [
      {
        title: "Marketplace Item — oneCampus",
      },
    ],
  }),
  component: MarketplaceItemPage,
});
