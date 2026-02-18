-- Anchor Investments Property Dashboard
-- Initial Schema

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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Future tables (scaffolded for Phase 2)
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  created_at timestamptz default now()
);

create table if not exists leases (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete set null,
  suite text,
  sq_ft integer,
  rent_psf numeric,
  lease_type text,
  start_date date,
  end_date date,
  options text,
  created_at timestamptz default now()
);

create table if not exists loans (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  lender text,
  original_amount numeric,
  current_balance numeric,
  interest_rate numeric,
  maturity_date date,
  loan_type text,
  notes text,
  created_at timestamptz default now()
);
