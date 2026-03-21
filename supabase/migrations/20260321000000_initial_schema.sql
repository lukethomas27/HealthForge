-- HealthForge Database Schema for Supabase
-- Run this in the Supabase SQL Editor to create all tables

-- ============================================
-- 1. DOCTORS
-- ============================================
create table doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text,
  email text unique not null,
  created_at timestamptz default now()
);

-- ============================================
-- 2. PATIENTS
-- ============================================
create table patients (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references doctors(id) on delete cascade,
  name text not null,
  dob date not null,
  email text unique not null,
  allergies text[] default '{}',
  medications text[] default '{}',
  city text,
  created_at timestamptz default now()
);

create index idx_patients_doctor on patients(doctor_id);

-- ============================================
-- 3. SESSIONS
-- ============================================
create table sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  date date not null default current_date,
  transcription text not null default '',
  created_at timestamptz default now()
);

create index idx_sessions_patient on sessions(patient_id);
create index idx_sessions_date on sessions(date desc);

-- ============================================
-- 4. INSIGHTS (one-to-one with sessions)
-- ============================================
create table insights (
  id uuid primary key default gen_random_uuid(),
  session_id uuid unique not null references sessions(id) on delete cascade,
  confidence integer not null check (confidence between 0 and 100),
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  summary text not null,
  plain_summary text not null,
  simple_summary text not null,
  differentials jsonb not null default '[]',
  -- format: [{ "label": "...", "pct": 68 }, ...]
  medication_flags text[] default '{}',
  wearable_note text,
  environmental_note text,
  actions_for_doctor text[] default '{}',
  delta text,
  created_at timestamptz default now()
);

create index idx_insights_session on insights(session_id);
create index idx_insights_confidence on insights(confidence);

-- ============================================
-- 5. PATIENT ACTIONS (many per insight)
-- ============================================
create table patient_actions (
  id uuid primary key default gen_random_uuid(),
  insight_id uuid not null references insights(id) on delete cascade,
  icon text not null,
  text text not null,
  category text not null check (category in ('medication', 'environment', 'activity', 'diet', 'warning', 'followup')),
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

create index idx_patient_actions_insight on patient_actions(insight_id);

-- ============================================
-- VIEWS (for easy querying from the frontend)
-- ============================================

-- Full session with insights joined
create or replace view session_details as
select
  s.id as session_id,
  s.patient_id,
  s.date,
  s.transcription,
  i.id as insight_id,
  i.confidence,
  i.risk_level,
  i.summary,
  i.plain_summary,
  i.simple_summary,
  i.differentials,
  i.medication_flags,
  i.wearable_note,
  i.environmental_note,
  i.actions_for_doctor,
  i.delta
from sessions s
left join insights i on i.session_id = s.id
order by s.date desc;

-- Patient overview for doctor dashboard
create or replace view patient_overview as
select
  p.id as patient_id,
  p.doctor_id,
  p.name,
  p.dob,
  p.email,
  p.allergies,
  p.medications,
  p.city,
  count(s.id) as session_count,
  max(s.date) as last_visit,
  (
    select i.confidence
    from sessions s2
    join insights i on i.session_id = s2.id
    where s2.patient_id = p.id
    order by s2.date desc
    limit 1
  ) as latest_confidence,
  (
    select i.risk_level
    from sessions s3
    join insights i on i.session_id = s3.id
    where s3.patient_id = p.id
    order by s3.date desc
    limit 1
  ) as latest_risk_level
from patients p
left join sessions s on s.patient_id = p.id
group by p.id;
