import { createFileRoute } from "@tanstack/react-router";
import { ReportLostPage } from "@/pages/ReportLost";

export const Route = createFileRoute("/lost-found/report-lost")({
  head: () => ({
    meta: [
      {
        title: "Report Lost Item — oneCampus",
      },
    ],
  }),
  component: ReportLostPage,
});
