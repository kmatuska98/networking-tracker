"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function CalendarStatusToast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const calendarStatus = searchParams.get("calendar");

  useEffect(() => {
    if (!calendarStatus) return;

    if (calendarStatus === "connected") {
      toast.success("Google Calendar connected.");
    } else if (calendarStatus === "error") {
      toast.error("Could not connect Google Calendar. Please try again.");
    }

    const next = new URLSearchParams(searchParams.toString());
    next.delete("calendar");
    router.replace(next.size > 0 ? `/contacts?${next.toString()}` : "/contacts");
    // Only run when the calendar status param itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarStatus]);

  return null;
}
