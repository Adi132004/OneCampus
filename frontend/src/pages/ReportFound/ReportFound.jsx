import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ReportForm } from "@/components/ReportForm";
import { getCurrentAuthUser, subscribeToAuth } from "@/lib/firebase";

export function ReportFoundPage() {
  const nav = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    const stored = getCurrentAuthUser();
    setIsSignedIn(Boolean(stored));
    setAuthResolved(true);
    const unsubscribe = subscribeToAuth((user) => {
      setIsSignedIn(Boolean(user));
      setAuthResolved(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authResolved && !isSignedIn) {
      window.location.replace(`/login?next=${encodeURIComponent("/lost-found/report-found")}`);
    }
  }, [authResolved, isSignedIn]);

  if (!isSignedIn) {
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
