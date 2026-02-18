-- Anchor Investments Property Dashboard
-- Initial schema

create extension if not exists pgcrypto;

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  property_name text not null unique,
  date_acquired text,
  original_investment_thesis text,
  owners_intent_10yr text,
  general_notes text,
  occupancy_rate text,
  market_psf_rate text,
  avg_psf_rate text,
  leasing_strategy text,
  vacancies text,
  tenant_mix text,
  renewals text,
  risks text,
  capex_budget jsonb,
  capex_outlook_summary text,
  long_term_items text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists leases (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists loans (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  created_at timestamptz not null default now()
);
