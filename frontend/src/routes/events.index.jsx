import { createFileRoute } from "@tanstack/react-router";
import { EventsPage } from "@/pages/Events";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      {
        title: "Events — oneCampus",
      },
    ],
  }),
  component: EventsPage,
});
