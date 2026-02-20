-- Extend Anchor Dashboard with asset and debt metrics

create table if not exists asset_metrics (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  snapshot_date date not null default current_date,
  occupancy_percent numeric,
  noi_ttm numeric,
  cap_rate numeric,
  avg_psf numeric,
  market_psf numeric,
  dscr numeric,
  notes text,
  source_sheet text,
  source_status text not null default 'extracted',
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id)
);

create index if not exists idx_asset_metrics_property_id on asset_metrics(property_id);

create table if not exists debt_schedule (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete set null,
  external_loan_key text not null unique,
  source_property_name text not null,
  loan_name text not null,
  lender text,
  loan_type text,
  square_feet numeric,
  base_rent numeric,
  additional_rent numeric,
  total_rent numeric,
  recoverable_opex_psf numeric,
  total_recoverable_opex numeric,
  opex_2025 numeric,
  noi_today numeric,
  noi_budget numeric,
  loan_balance numeric,
  debt_service numeric,
  dsc_market numeric,
  dsc_budget numeric,
  dsc_requirement numeric,
  cash_flow numeric,
  as_of_825 numeric,
  monthly_payment numeric,
  interest_rate numeric,
  interest_rate_label text,
  rate_margin text,
  current_rate numeric,
  maturity_date date,
  origination_date date,
  notes text,
  ml_notes text,
  eli_notes text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_debt_schedule_property_id on debt_schedule(property_id);
create index if not exists idx_debt_schedule_maturity_date on debt_schedule(maturity_date);
