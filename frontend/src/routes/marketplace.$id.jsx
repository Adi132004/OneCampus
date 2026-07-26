import { createFileRoute } from "@tanstack/react-router";
import { MarketplaceItemPage } from "@/pages/MarketplaceItem";

export const Route = createFileRoute("/marketplace/$id")({
  component: MarketplaceItemPage,
});
