import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ReportForm } from "@/components/ReportForm";
import { getCurrentAuthUser, subscribeToAuth } from "@/lib/firebase";
export function ReportFoundPage() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const unsub = subscribeToAuth(setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!getCurrentAuthUser()) {
      window.location.href = `/login?next=${encodeURIComponent("/lost-found/report-found")}`;
    }
  }, []);

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
