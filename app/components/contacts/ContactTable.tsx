import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Contact, SortDirection, SortField } from "@/lib/types/contact";

const PRIORITY_VARIANT: Record<Contact["priority"], "default" | "secondary" | "outline"> = {
  high: "default",
  medium: "secondary",
  low: "outline",
};

interface ContactTableProps {
  contacts: Contact[];
  sort: SortField;
  direction: SortDirection;
  onSortChange: (field: SortField) => void;
  onDeleteRequest: (contact: Contact) => void;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SortButton({
  field,
  label,
  sort,
  direction,
  onSortChange,
}: {
  field: SortField;
  label: string;
  sort: SortField;
  direction: SortDirection;
  onSortChange: (field: SortField) => void;
}) {
  const isActive = sort === field;
  const Icon = isActive ? (direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      type="button"
      onClick={() => onSortChange(field)}
      className="inline-flex items-center gap-1 font-medium hover:text-foreground"
    >
      {label}
      <Icon className="size-3.5" />
    </button>
  );
}

export function ContactTable({
  contacts,
  sort,
  direction,
  onSortChange,
  onDeleteRequest,
}: ContactTableProps) {
  return (
    <>
      {/* Desktop / tablet: full table */}
      <div className="hidden overflow-x-auto rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton field="name" label="Name" sort={sort} direction={direction} onSortChange={onSortChange} />
              </TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Met at</TableHead>
              <TableHead>
                <SortButton field="priority" label="Priority" sort={sort} direction={direction} onSortChange={onSortChange} />
              </TableHead>
              <TableHead>
                <SortButton
                  field="next_follow_up_date"
                  label="Next follow-up"
                  sort={sort}
                  direction={direction}
                  onSortChange={onSortChange}
                />
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>{contact.company || "—"}</TableCell>
                <TableCell>{contact.role || "—"}</TableCell>
                <TableCell>{contact.met_at || "—"}</TableCell>
                <TableCell>
                  <Badge variant={PRIORITY_VARIANT[contact.priority]} className="capitalize">
                    {contact.priority}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(contact.next_follow_up_date)}</TableCell>
                <TableCell className="text-right">
                  <RowActions contact={contact} onDeleteRequest={onDeleteRequest} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {contacts.map((contact) => (
          <div key={contact.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted-foreground">
                  {[contact.role, contact.company].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <Badge variant={PRIORITY_VARIANT[contact.priority]} className="capitalize">
                {contact.priority}
              </Badge>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Met at</dt>
                <dd>{contact.met_at || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Next follow-up</dt>
                <dd>{formatDate(contact.next_follow_up_date)}</dd>
              </div>
            </dl>
            <div className="mt-3 flex justify-end">
              <RowActions contact={contact} onDeleteRequest={onDeleteRequest} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function RowActions({
  contact,
  onDeleteRequest,
}: {
  contact: Contact;
  onDeleteRequest: (contact: Contact) => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <Link
        href={`/contacts/${contact.id}/edit`}
        aria-label={`Edit ${contact.name}`}
        className={buttonVariants({ variant: "ghost", size: "icon" })}
      >
        <Pencil className="size-4" />
      </Link>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Delete ${contact.name}`}
        onClick={() => onDeleteRequest(contact)}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
