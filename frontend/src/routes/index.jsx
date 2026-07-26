import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/pages/Home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "oneCampus - Your campus, one board.",
      },
      {
        name: "description",
        content: "Buy, sell, and find anything scoped to your college.",
      },
      {
        property: "og:title",
        content: "oneCampus - Your campus, one board.",
      },
      {
        property: "og:description",
        content: "Buy, sell, and find anything scoped to your college.",
      },
    ],
  }),
  component: HomePage,
});
