-- Networking tracker: contacts table.
-- Run this against your Neon project (Neon SQL editor, or `psql "$DATABASE_URL" -f db/schema.sql`)
-- AFTER Neon Auth (Managed Better Auth) is enabled, since auth.user_id() must exist.

create type contact_priority as enum ('high', 'medium', 'low');

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
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_contacts_user_id on contacts(user_id);
create index if not exists idx_contacts_priority on contacts(priority);
create index if not exists idx_contacts_next_follow_up on contacts(next_follow_up_date);

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
