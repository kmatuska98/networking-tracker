import "server-only";
import { getServerDataClient } from "@/lib/server/data-client";
import { setContactCalendarEventId } from "@/lib/server/contacts.repository";
import type { Contact } from "@/lib/types/contact";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

interface CalendarConnection {
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
}

class GoogleCalendarError extends Error {}

async function getConnection(): Promise<CalendarConnection | null> {
  const client = getServerDataClient();
  const result = await client
    .from("google_calendar_connections")
    .select("access_token, refresh_token, token_expires_at")
    .maybeSingle();
  if (result.error) throw new GoogleCalendarError(result.error.message);
  return result.data as CalendarConnection | null;
}

export async function saveConnection(tokens: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}): Promise<void> {
  const client = getServerDataClient();
  const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
  const result = await client
    .from("google_calendar_connections")
    .upsert(
      {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: tokenExpiresAt,
      },
      { onConflict: "user_id" }
    )
    .select()
    .maybeSingle();
  if (result.error) throw new GoogleCalendarError(result.error.message);
}

export async function disconnectCalendar(): Promise<void> {
  const client = getServerDataClient();
  const result = await client.from("google_calendar_connections").delete().select().maybeSingle();
  if (result.error) throw new GoogleCalendarError(result.error.message);
}

export async function isCalendarConnected(): Promise<boolean> {
  const connection = await getConnection();
  return connection !== null;
}

/**
 * Returns a valid access token for the current user, refreshing it against
 * Google's token endpoint first if it has expired. Returns null if the user
 * has never connected their calendar — callers treat that as "skip sync",
 * not an error.
 */
async function getValidAccessToken(): Promise<string | null> {
  const connection = await getConnection();
  if (!connection) return null;

  const expiresAt = new Date(connection.token_expires_at).getTime();
  const isExpiringSoon = expiresAt - Date.now() < 60_000;
  if (!isExpiringSoon) {
    return connection.access_token;
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: connection.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    // Refresh token was revoked or expired (common for unverified/"Testing"
    // Google OAuth apps after ~7 days) — treat as disconnected rather than
    // throwing, so contact saves still succeed without calendar sync.
    await disconnectCalendar().catch(() => {});
    return null;
  }

  const body = (await response.json()) as { access_token: string; expires_in: number };
  await saveConnection({
    access_token: body.access_token,
    refresh_token: connection.refresh_token,
    expires_in: body.expires_in,
  });
  return body.access_token;
}

function addDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function buildEventBody(contact: Contact) {
  const detailLines = [
    contact.company ? `Company: ${contact.company}` : null,
    contact.role ? `Role: ${contact.role}` : null,
    contact.met_at ? `Met at: ${contact.met_at}` : null,
    contact.notes ? `Notes: ${contact.notes}` : null,
  ].filter(Boolean);

  return {
    summary: `Follow up with ${contact.name}`,
    description: detailLines.length > 0 ? detailLines.join("\n") : undefined,
    start: { date: contact.next_follow_up_date! },
    end: { date: addDays(contact.next_follow_up_date!, 1) },
  };
}

/**
 * Best-effort sync of a contact's next-follow-up date to a Google Calendar
 * event. Never throws — callers should not fail a contact save just because
 * calendar sync failed (revoked token, transient API error, etc). Returns a
 * warning string to surface to the user, or null on success/no-op.
 */
export async function syncCalendarForContact(contact: Contact): Promise<string | null> {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken) return null; // not connected — nothing to do

    const hasDate = Boolean(contact.next_follow_up_date);
    const hasEvent = Boolean(contact.google_calendar_event_id);

    if (!hasDate && hasEvent) {
      await fetch(`${CALENDAR_EVENTS_URL}/${contact.google_calendar_event_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      await setContactCalendarEventId(contact.id, null);
      return null;
    }

    if (!hasDate) return null;

    const url = hasEvent ? `${CALENDAR_EVENTS_URL}/${contact.google_calendar_event_id}` : CALENDAR_EVENTS_URL;
    const method = hasEvent ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildEventBody(contact)),
    });

    if (!response.ok) {
      return "Contact saved, but couldn't sync to Google Calendar.";
    }

    if (!hasEvent) {
      const event = (await response.json()) as { id: string };
      await setContactCalendarEventId(contact.id, event.id);
    }

    return null;
  } catch {
    return "Contact saved, but couldn't sync to Google Calendar.";
  }
}

/** Best-effort cleanup when a contact with a synced event is deleted. */
export async function deleteCalendarEventForContact(contact: Contact): Promise<void> {
  if (!contact.google_calendar_event_id) return;
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken) return;
    await fetch(`${CALENDAR_EVENTS_URL}/${contact.google_calendar_event_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    // Best effort — the contact is being deleted either way.
  }
}
