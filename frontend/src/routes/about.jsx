import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/pages/About";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      {
        title: "About - oneCampus",
      },
      {
        name: "description",
        content: "Why oneCampus exists and who is behind it.",
      },
    ],
  }),
  component: AboutPage,
});
