-- Enable RLS on all tables and add permissive policies for demo
-- In production, these would be scoped to authenticated users

alter table doctors enable row level security;
alter table patients enable row level security;
alter table sessions enable row level security;
alter table insights enable row level security;
alter table patient_actions enable row level security;

-- Read access for all (demo: anon can read everything)
create policy "Allow read access to doctors" on doctors for select using (true);
create policy "Allow read access to patients" on patients for select using (true);
create policy "Allow read access to sessions" on sessions for select using (true);
create policy "Allow read access to insights" on insights for select using (true);
create policy "Allow read access to patient_actions" on patient_actions for select using (true);

-- Write access for all (demo: anon can insert/update/delete)
create policy "Allow insert on sessions" on sessions for insert with check (true);
create policy "Allow update on sessions" on sessions for update using (true);
create policy "Allow delete on sessions" on sessions for delete using (true);

create policy "Allow insert on insights" on insights for insert with check (true);
create policy "Allow update on insights" on insights for update using (true);
create policy "Allow delete on insights" on insights for delete using (true);

create policy "Allow insert on patient_actions" on patient_actions for insert with check (true);
create policy "Allow update on patient_actions" on patient_actions for update using (true);
create policy "Allow delete on patient_actions" on patient_actions for delete using (true);
