import { createFileRoute } from "@tanstack/react-router";
import { MarketplaceSellPage } from "@/pages/MarketplaceSell";

export const Route = createFileRoute("/marketplace/sell")({
  head: () => ({
    meta: [
      {
        title: "Sell — oneCampus",
      },
    ],
  }),

  component: MarketplaceSellPage,
});