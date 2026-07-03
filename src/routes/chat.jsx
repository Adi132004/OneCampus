import { createFileRoute } from "@tanstack/react-router";
import { AIChatPage } from "@/pages/AIChat";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      {
        title: "Chat - oneCampus",
      },
    ],
  }),
  component: AIChatPage,
});
