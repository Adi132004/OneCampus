import { useNavigate } from "@tanstack/react-router";
import { ReportForm } from "@/components/ReportForm";
import { getCurrentAuthUser } from "@/lib/firebase";
export function ReportFoundPage() {
  const nav = useNavigate();
  const user = getCurrentAuthUser();

  if (!user && typeof window !== "undefined") {
    window.location.href = `/login?next=${encodeURIComponent("/lost-found/report-found")}`;
    return null;
  }

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
