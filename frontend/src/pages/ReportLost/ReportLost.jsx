import { useNavigate } from "@tanstack/react-router";
import { ReportForm } from "@/components/ReportForm";
import { getCurrentAuthUser } from "@/lib/firebase";
export function ReportLostPage() {
  const nav = useNavigate();
  const user = getCurrentAuthUser();

  if (!user && typeof window !== "undefined") {
    window.location.href = `/login?next=${encodeURIComponent("/lost-found/report-lost")}`;
    return null;
  }

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
