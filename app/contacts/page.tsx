import { Suspense } from "react";
import { CalendarStatusToast } from "@/app/components/contacts/CalendarStatusToast";
import { ContactsView } from "@/app/components/contacts/ContactsView";
import { GoogleCalendarCard } from "@/app/components/contacts/GoogleCalendarCard";
import { StageSection } from "@/app/components/contacts/StageSection";
import { RELATIONSHIP_STAGES } from "@/lib/types/contact";

export const dynamic = "force-dynamic";

export default function ContactsPage() {
  return (
    <div className="space-y-8">
      <Suspense>
        <CalendarStatusToast />
      </Suspense>

      <Suspense fallback={<div className="h-16 rounded-lg border" />}>
        <GoogleCalendarCard />
      </Suspense>

      <div className="grid gap-4 sm:grid-cols-3">
        {RELATIONSHIP_STAGES.map((stage) => (
          <Suspense key={stage} fallback={<div className="h-40 rounded-lg border" />}>
            <StageSection stage={stage} />
          </Suspense>
        ))}
      </div>

      <div id="all-contacts" className="scroll-mt-4">
        <Suspense>
          <ContactsView />
        </Suspense>
      </div>
    </div>
  );
}
