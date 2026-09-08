-- Row-Level Security ownership policies for the contacts table.
-- Run AFTER db/schema.sql. Requires Neon Auth's auth.user_id() function.

alter table contacts enable row level security;

drop policy if exists contacts_select_own on contacts;
create policy contacts_select_own
  on contacts
  for select
  using (auth.user_id() = user_id);

drop policy if exists contacts_insert_own on contacts;
create policy contacts_insert_own
  on contacts
  for insert
  with check (auth.user_id() = user_id);

drop policy if exists contacts_update_own on contacts;
create policy contacts_update_own
  on contacts
  for update
  using (auth.user_id() = user_id)
  with check (auth.user_id() = user_id);

drop policy if exists contacts_delete_own on contacts;
create policy contacts_delete_own
  on contacts
  for delete
  using (auth.user_id() = user_id);

-- Grant table-level privileges to the authenticated role used by the Data API.
-- RLS policies above still scope every row to its owner.
grant select, insert, update, delete on contacts to authenticated;
