import { createFileRoute } from "@tanstack/react-router";
import { MarketplacePage } from "@/pages/Marketplace";

export const Route = createFileRoute("/marketplace/")({
  head: () => ({
    meta: [
      {
        title: "Marketplace — oneCampus",
      },
      {
        name: "description",
        content: "Buy and sell on your campus.",
      },
    ],
  }),
  component: MarketplacePage,
});
