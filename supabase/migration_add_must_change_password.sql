-- Add must_change_password column and self-update policy
alter table staff_roles add column if not exists must_change_password boolean not null default true;

-- Allow authenticated users to update their own staff_roles row
create policy "self_update_staff_roles" on staff_roles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
