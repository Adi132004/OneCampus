import { useNavigate } from "@tanstack/react-router";
import { ReportForm } from "@/components/ReportForm";
export function ReportFoundPage() {
  const nav = useNavigate();
  return (
    <ReportForm
      kind="found"
      onDone={() =>
        nav({
          to: "/lost-found",
        })
      }
    />
  );
}
