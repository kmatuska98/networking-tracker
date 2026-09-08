import { Suspense } from "react";
import { ContactsView } from "@/app/components/contacts/ContactsView";

export default function ContactsPage() {
  return (
    <Suspense>
      <ContactsView />
    </Suspense>
  );
}
