import { buttonVariants } from "@/components/ui/button";
import { isCalendarConnected } from "@/lib/server/google-calendar";
import { DisconnectCalendarButton } from "./DisconnectCalendarButton";

export async function GoogleCalendarCard() {
  const connected = await isCalendarConnected();

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div>
        <p className="text-sm font-medium">Google Calendar</p>
        <p className="text-sm text-muted-foreground">
          {connected
            ? "Connected — next-follow-up dates automatically sync to your calendar."
            : "Connect your calendar so next-follow-up dates automatically create reminders."}
        </p>
      </div>
      {connected ? (
        <DisconnectCalendarButton />
      ) : (
        <a href="/api/google-calendar/connect" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Connect
        </a>
      )}
    </div>
  );
}
