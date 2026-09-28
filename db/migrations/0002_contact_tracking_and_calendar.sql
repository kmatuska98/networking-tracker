-- Adds relationship-tracking fields to contacts, plus a table for storing
-- per-user Google Calendar OAuth tokens (for automatic follow-up syncing).
-- Run against an already-provisioned database (one that already has
-- db/schema.sql + db/rls_policies.sql applied). A fresh clone instead runs
-- db/schema.sql, which already includes these columns.

create type contact_method as enum ('phone', 'linkedin', 'slack', 'email', 'other');
create type relationship_stage as enum ('cold_outreach', 'warm_connection', 'established');

alter table contacts
  add column if not exists last_contacted_date date,
  add column if not exists contact_method contact_method,
  add column if not exists relationship_stage relationship_stage not null default 'cold_outreach',
  add column if not exists google_calendar_event_id text;

create index if not exists idx_contacts_relationship_stage on contacts(relationship_stage);

-- Per-user Google Calendar OAuth tokens. Server-only: never read outside
-- lib/server/**, never sent to the client. Same ownership pattern as contacts.
create table if not exists google_calendar_connections (
  user_id             text primary key default auth.user_id(),
  access_token        text not null,
  refresh_token       text not null,
  token_expires_at    timestamptz not null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table google_calendar_connections enable row level security;

drop policy if exists gcal_select_own on google_calendar_connections;
create policy gcal_select_own on google_calendar_connections
  for select using (auth.user_id() = user_id);

drop policy if exists gcal_insert_own on google_calendar_connections;
create policy gcal_insert_own on google_calendar_connections
  for insert with check (auth.user_id() = user_id);

drop policy if exists gcal_update_own on google_calendar_connections;
create policy gcal_update_own on google_calendar_connections
  for update using (auth.user_id() = user_id) with check (auth.user_id() = user_id);

drop policy if exists gcal_delete_own on google_calendar_connections;
create policy gcal_delete_own on google_calendar_connections
  for delete using (auth.user_id() = user_id);

grant select, insert, update, delete on google_calendar_connections to authenticated;

drop trigger if exists trg_gcal_updated_at on google_calendar_connections;
create trigger trg_gcal_updated_at
before update on google_calendar_connections
for each row
execute function set_updated_at();
