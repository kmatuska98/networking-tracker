import { EditContactLoader } from "@/app/components/contacts/EditContactLoader";

export default async function EditContactPage({
  params,
}: PageProps<"/contacts/[id]/edit">) {
  const { id } = await params;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit contact</h1>
      <EditContactLoader contactId={id} />
    </div>
  );
}
