-- Migration: Family Sharing Feature
-- Adds support for sharing individual sessions or full history with family/friends

create type share_access_type as enum ('individual_session', 'full_history');
create type share_status as enum ('pending', 'accepted', 'revoked');

create table patient_shares (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  shared_with_email text not null,
  access_type share_access_type not null,
  session_id uuid references sessions(id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  status share_status not null default 'pending',
  created_at timestamptz default now(),
  
  -- Ensure session_id is present if access_type is individual_session
  constraint check_session_id_if_individual check (
    (access_type = 'individual_session' and session_id is not null) or
    (access_type = 'full_history' and session_id is null)
  )
);

create index idx_patient_shares_patient on patient_shares(patient_id);
create index idx_patient_shares_token on patient_shares(token);

-- RLS Policies (Simplified for demo, assuming anon access for tokens)
alter table patient_shares enable row level security;

create policy "Patients can manage their own shares"
  on patient_shares for all
  using (true); -- In a real app, this would check auth.uid() matches patient's user id

create policy "Anyone with a valid token can view the share"
  on patient_shares for select
  using (status != 'revoked');
