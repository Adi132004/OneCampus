import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ReportForm } from "@/components/ReportForm";
import { getCurrentAuthUser, subscribeToAuth } from "@/lib/firebase";
export function ReportLostPage() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const unsub = subscribeToAuth(setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!getCurrentAuthUser()) {
      window.location.href = `/login?next=${encodeURIComponent("/lost-found/report-lost")}`;
    }
  }, []);

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
