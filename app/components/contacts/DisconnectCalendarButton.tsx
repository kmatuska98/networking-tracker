"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DisconnectCalendarButton() {
  const router = useRouter();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  async function handleDisconnect() {
    setIsDisconnecting(true);
    try {
      const response = await fetch("/api/google-calendar/disconnect", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error();
      toast.success("Google Calendar disconnected.");
      router.refresh();
    } catch {
      toast.error("Could not disconnect. Please try again.");
    } finally {
      setIsDisconnecting(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={isDisconnecting}>
      {isDisconnecting ? "Disconnecting…" : "Disconnect"}
    </Button>
  );
}
