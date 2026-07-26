import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/Login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      {
        title: "Login - oneCampus",
      },
      {
        name: "description",
        content: "Log in to your oneCampus account.",
      },
    ],
  }),
  component: LoginPage,
});
