import { useNavigate } from "@tanstack/react-router";
import { ReportForm } from "@/components/ReportForm";
export function ReportLostPage() {
  const nav = useNavigate();
  return (
    <ReportForm
      kind="lost"
      onDone={() =>
        nav({
          to: "/lost-found",
        })
      }
    />
  );
}
