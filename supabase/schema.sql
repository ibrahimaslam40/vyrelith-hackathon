-- Vyrelith Phase 8 — Supabase schema
-- Single-user, no-accounts model (per design doc §11.4): every table holds
-- one demo user's data, no user_id column. RLS is enabled with NO policies
-- on every table, per the workshop rule — only the backend, using the
-- secret key (which bypasses RLS), can touch the data. The anon/public key
-- must never be able to read or write here.
--
-- ids are `text`, not `uuid`: the app generates its own deterministic
-- string ids (e.g. `entry-2024-06-01`, `med-naproxen`, `cycle-0`) rather
-- than random UUIDs, so the columns have to match that shape.

drop table if exists photos;
drop table if exists medication_doses;
drop table if exists symptom_entries;
drop table if exists cycle_events;
drop table if exists medications;
drop table if exists care_events;
drop table if exists user_profiles;

create table user_profiles (
  id text primary key,
  email text not null default '',
  display_name text not null default '',
  journey_stage text not null default 'seeking_answers'
    check (journey_stage in ('seeking_answers', 'recently_diagnosed', 'managing')),
  conditions text[] not null default '{}',
  first_symptom_date date,
  cycle_tracking_enabled boolean not null default false,
  research_opt_in boolean not null default false,
  created_at timestamptz not null default now()
);

create table symptom_entries (
  id text primary key,
  date date not null unique,
  day_rating text check (day_rating in ('rough', 'managing', 'good')),
  -- groups mirrors SymptomEntry['groups'] in types.ts verbatim (groupId,
  -- chipIds, severity, energyLevel, bodyRegions, photoIds) — kept as jsonb
  -- rather than normalized, since it's already an embedded array in the type.
  groups jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table photos (
  id text primary key,
  entry_id text references symptom_entries(id) on delete cascade,
  group_id text not null,
  data_url text not null,
  body_region text,
  chip_ids text[] not null default '{}',
  severity smallint check (severity between 0 and 10),
  captured_at timestamptz not null default now()
);

create table cycle_events (
  id text primary key,
  type text not null check (type in ('period_start', 'period_end', 'spotting')),
  date date not null
);

create table medications (
  id text primary key,
  name text not null,
  cadence text not null
    check (cadence in ('daily', 'weekly', 'biweekly', 'monthly', 'as_needed')),
  dose_day smallint check (dose_day between 0 and 6),
  started_on date not null,
  active boolean not null default true
);

create table medication_doses (
  id text primary key,
  medication_id text references medications(id) on delete cascade,
  taken_at timestamptz not null default now()
);

create table care_events (
  id text primary key,
  type text not null check (type in (
    'symptom_onset', 'gp_visit', 'specialist_visit', 'referral',
    'test_ordered', 'test_result', 'diagnosis', 'treatment_started'
  )),
  date date not null,
  specialty text,
  title text not null,
  note text,
  status text check (status in ('pending', 'complete', 'waiting'))
);

alter table user_profiles enable row level security;
alter table symptom_entries enable row level security;
alter table photos enable row level security;
alter table cycle_events enable row level security;
alter table medications enable row level security;
alter table medication_doses enable row level security;
alter table care_events enable row level security;
