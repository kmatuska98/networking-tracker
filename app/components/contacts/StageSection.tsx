import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { listContacts } from "@/lib/server/contacts.repository";
import { RELATIONSHIP_STAGE_LABELS, type RelationshipStage } from "@/lib/types/contact";

const PREVIEW_LIMIT = 5;

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  high: "default",
  medium: "secondary",
  low: "outline",
};

export async function StageSection({ stage }: { stage: RelationshipStage }) {
  // Fetch one extra row so we know whether "View all" is needed, without a
  // separate count query.
  const contacts = await listContacts({
    stage,
    sort: "priority",
    direction: "desc",
    limit: PREVIEW_LIMIT + 1,
  });
  const preview = contacts.slice(0, PREVIEW_LIMIT);
  const hasMore = contacts.length > PREVIEW_LIMIT;

  return (
    <section className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-medium">{RELATIONSHIP_STAGE_LABELS[stage]}</h2>
        {preview.length > 0 ? (
          <Link
            href={`/contacts?stage=${stage}#all-contacts`}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {hasMore ? "View all →" : "View →"}
          </Link>
        ) : null}
      </div>

      {preview.length === 0 ? (
        <p className="text-sm text-muted-foreground">No contacts in this stage yet.</p>
      ) : (
        <ul className="divide-y">
          {preview.map((contact) => (
            <li key={contact.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <div className="min-w-0">
                <Link href={`/contacts/${contact.id}/edit`} className="truncate font-medium hover:underline">
                  {contact.name}
                </Link>
                {contact.company ? (
                  <span className="ml-2 text-muted-foreground">{contact.company}</span>
                ) : null}
              </div>
              <Badge variant={PRIORITY_VARIANT[contact.priority]} className="shrink-0 capitalize">
                {contact.priority}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
