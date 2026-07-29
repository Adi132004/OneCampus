import { createFileRoute } from "@tanstack/react-router";
import { LostFoundPage } from "@/pages/LostFound";

export const Route = createFileRoute("/lost-found/")({
  head: () => ({
    meta: [
      {
        title: "Lost & Found — oneCampus",
      },
    ],
  }),
  component: LostFoundPage,
});
