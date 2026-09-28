-- Networking tracker: contacts table.
-- Run this against your Neon project (Neon SQL editor, or `psql "$DATABASE_URL" -f db/schema.sql`)
-- AFTER Neon Auth (Managed Better Auth) is enabled, since auth.user_id() must exist.

create type contact_priority as enum ('high', 'medium', 'low');
create type contact_method as enum ('phone', 'linkedin', 'slack', 'email', 'other');
create type relationship_stage as enum ('cold_outreach', 'warm_connection', 'established');

create table if not exists contacts (
  id                    uuid primary key default gen_random_uuid(),
  user_id               text not null default auth.user_id(),
  name                  text not null check (btrim(name) <> ''),
  company               text,
  role                  text,
  met_at                text,
  notes                 text,
  priority              contact_priority not null default 'medium',
  next_follow_up_date   date,
  last_contacted_date   date,
  contact_method        contact_method,
  relationship_stage    relationship_stage not null default 'cold_outreach',
  google_calendar_event_id text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_contacts_user_id on contacts(user_id);
create index if not exists idx_contacts_priority on contacts(priority);
create index if not exists idx_contacts_next_follow_up on contacts(next_follow_up_date);
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

-- Keep updated_at current on every row update.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_contacts_updated_at on contacts;
create trigger trg_contacts_updated_at
before update on contacts
for each row
execute function set_updated_at();

drop trigger if exists trg_gcal_updated_at on google_calendar_connections;
create trigger trg_gcal_updated_at
before update on google_calendar_connections
for each row
execute function set_updated_at();
