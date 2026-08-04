import { createFileRoute } from "@tanstack/react-router";
import { CreateEventPage } from "@/pages/Events";

export const Route = createFileRoute("/events/create")({
  head: () => ({
    meta: [
      {
        title: "Create Event — oneCampus",
      },
    ],
  }),
  component: CreateEventPage,
});
