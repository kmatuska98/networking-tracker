import "server-only";
import { getServerDataClient } from "@/lib/server/data-client";
import type { Contact, ContactInput, SortDirection, SortField } from "@/lib/types/contact";

const SORTABLE_FIELDS: SortField[] = ["name", "priority", "next_follow_up_date", "created_at"];

export class RepositoryError extends Error {}

function assertOk<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) {
    throw new RepositoryError(result.error.message);
  }
  return result.data as T;
}

export interface ListContactsOptions {
  sort?: string | null;
  direction?: string | null;
  priority?: string | null;
  search?: string | null;
}

/**
 * All Data API access for contacts lives here (the Next.js "Data Access
 * Layer" pattern). RLS in db/rls_policies.sql is the ultimate ownership
 * enforcement, so every query below runs through a client that carries the
 * current user's token (see getServerDataClient) — there is no user_id filter
 * written here because the database itself won't return or accept rows that
 * don't belong to the caller.
 */
export async function listContacts(options: ListContactsOptions): Promise<Contact[]> {
  const client = getServerDataClient();
  const sortField = SORTABLE_FIELDS.includes(options.sort as SortField)
    ? (options.sort as SortField)
    : "created_at";
  const direction: SortDirection = options.direction === "asc" ? "asc" : "desc";

  let query = client.from("contacts").select("*");

  if (options.priority && ["high", "medium", "low"].includes(options.priority)) {
    query = query.eq("priority", options.priority);
  }

  if (options.search) {
    const term = `%${options.search}%`;
    query = query.or(`name.ilike.${term},company.ilike.${term}`);
  }

  query = query.order(sortField, { ascending: direction === "asc" });

  const result = await query;
  return assertOk(result as { data: Contact[] | null; error: { message: string } | null });
}

export async function getContact(id: string): Promise<Contact | null> {
  const client = getServerDataClient();
  const result = await client.from("contacts").select("*").eq("id", id).maybeSingle();
  return assertOk(result as { data: Contact | null; error: { message: string } | null });
}

export async function createContact(input: ContactInput): Promise<Contact> {
  const client = getServerDataClient();
  const result = await client
    .from("contacts")
    .insert({
      name: input.name.trim(),
      company: input.company?.trim() || null,
      role: input.role?.trim() || null,
      met_at: input.met_at?.trim() || null,
      notes: input.notes?.trim() || null,
      priority: input.priority,
      next_follow_up_date: input.next_follow_up_date || null,
    })
    .select()
    .single();
  return assertOk(result as { data: Contact | null; error: { message: string } | null });
}

export async function updateContact(id: string, input: ContactInput): Promise<Contact | null> {
  const client = getServerDataClient();
  const result = await client
    .from("contacts")
    .update({
      name: input.name.trim(),
      company: input.company?.trim() || null,
      role: input.role?.trim() || null,
      met_at: input.met_at?.trim() || null,
      notes: input.notes?.trim() || null,
      priority: input.priority,
      next_follow_up_date: input.next_follow_up_date || null,
    })
    .eq("id", id)
    .select()
    .maybeSingle();
  return assertOk(result as { data: Contact | null; error: { message: string } | null });
}

export async function deleteContact(id: string): Promise<Contact | null> {
  const client = getServerDataClient();
  const result = await client.from("contacts").delete().eq("id", id).select().maybeSingle();
  return assertOk(result as { data: Contact | null; error: { message: string } | null });
}
