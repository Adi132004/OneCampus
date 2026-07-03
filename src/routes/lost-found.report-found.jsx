import { createFileRoute } from "@tanstack/react-router";
import { ReportFoundPage } from "@/pages/ReportFound";

export const Route = createFileRoute("/lost-found/report-found")({
  head: () => ({
    meta: [
      {
        title: "Report Found Item — oneCampus",
      },
    ],
  }),
  component: ReportFoundPage,
});
