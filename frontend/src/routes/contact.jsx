import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/pages/Contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      {
        title: "Contact - oneCampus",
      },
      {
        name: "description",
        content: "Reach the oneCampus team.",
      },
    ],
  }),
  component: ContactPage,
});
