import { createFileRoute } from "@tanstack/react-router";
import { SignupPage } from "@/pages/Signup";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      {
        title: "Sign up - oneCampus",
      },
      {
        name: "description",
        content: "Create your oneCampus account.",
      },
    ],
  }),
  component: SignupPage,
});
