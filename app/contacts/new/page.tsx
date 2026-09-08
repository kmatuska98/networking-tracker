import { ContactForm } from "@/app/components/contacts/ContactForm";

export default function NewContactPage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Add contact</h1>
      <ContactForm mode="create" />
    </div>
  );
}
