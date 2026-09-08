"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Contact, SortDirection, SortField } from "@/lib/types/contact";
import { ContactFilterBar } from "./ContactFilterBar";
import { ContactTable } from "./ContactTable";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

type Status = "loading" | "success" | "error";

export function ContactsView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sort = (searchParams.get("sort") as SortField) || "created_at";
  const direction = (searchParams.get("dir") as SortDirection) || "desc";
  const priority = searchParams.get("priority") || "all";
  const search = searchParams.get("q") || "";

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [contactPendingDelete, setContactPendingDelete] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "all") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      router.push(`/contacts?${next.toString()}`);
    },
    [router, searchParams]
  );

  const loadContacts = useCallback(async () => {
    setStatus("loading");
    try {
      const params = new URLSearchParams({ sort, dir: direction });
      if (priority !== "all") params.set("priority", priority);
      if (search) params.set("q", search);

      const response = await fetch(`/api/contacts?${params.toString()}`, {
        credentials: "include",
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body?.errors?.form || "Could not load contacts.");
      }

      setContacts(body.contacts);
      setStatus("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load contacts.");
      setStatus("error");
    }
  }, [sort, direction, priority, search]);

  useEffect(() => {
    // Intentional: refetch from the API whenever sort/filter URL params change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadContacts();
  }, [loadContacts]);

  async function handleConfirmDelete() {
    if (!contactPendingDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/contacts/${contactPendingDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.errors?.form || "Could not delete contact.");
      }
      toast.success(`Deleted ${contactPendingDelete.name}.`);
      setContactPendingDelete(null);
      await loadContacts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete contact.");
    } finally {
      setIsDeleting(false);
    }
  }

  const hasActiveFilters = priority !== "all" || search.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Your contacts</h1>
        <Link href="/contacts/new" className={buttonVariants()}>
          Add contact
        </Link>
      </div>

      <ContactFilterBar
        priority={priority}
        search={search}
        onPriorityChange={(value) => updateParams({ priority: value })}
        onSearchChange={(value) => updateParams({ q: value })}
      />

      {status === "loading" ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : status === "error" ? (
        <ErrorState message={errorMessage} onRetry={loadContacts} />
      ) : contacts.length === 0 ? (
        <EmptyState
          hasActiveFilters={hasActiveFilters}
          onClearFilters={() => updateParams({ priority: "all", q: "" })}
        />
      ) : (
        <ContactTable
          contacts={contacts}
          sort={sort}
          direction={direction}
          onSortChange={(field) =>
            updateParams({
              sort: field,
              dir: sort === field && direction === "asc" ? "desc" : "asc",
            })
          }
          onDeleteRequest={setContactPendingDelete}
        />
      )}

      <DeleteConfirmDialog
        open={contactPendingDelete !== null}
        contactName={contactPendingDelete?.name ?? null}
        onOpenChange={(open) => !open && setContactPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
