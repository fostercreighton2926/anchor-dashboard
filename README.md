# Anchor Investments Property Dashboard

Next.js 14 + Supabase dashboard for Anchor Investments, focused on portfolio-level visibility across 28 commercial real estate properties.

## What This App Includes

- Portfolio overview with key metrics:
  - total properties
  - average occupancy
  - count at 100% occupancy
  - count below 80% occupancy
- Property cards with occupancy status, first upcoming renewal, and next CapEx item
- Property detail pages for each asset with sections for Overview, Leasing, CapEx, and Notes
- Supabase schema for `properties` plus scaffold tables for `tenants`, `leases`, and `loans`

## Prerequisites

- Node.js 18+
- Existing `.env.local` with Supabase credentials (already present in this project)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the SQL migration in Supabase SQL Editor:
```sql
-- use file contents from
supabase/migrations/001_initial.sql
```

3. Seed portfolio data from `data/properties.json`:
```bash
npm run seed
```

4. Start the development server:
```bash
npm run dev
```

## Environment Variables

This project expects these values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Deployment (Vercel)

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Add the same environment variables from `.env.local` in Vercel project settings.
4. Deploy.

## Future Roadmap

- `tenants`: detailed tenant records, contacts, reporting views
- `leases`: lease term tracking, option windows, renewal pipeline
- `loans`: debt schedule monitoring and refinancing timeline
- capex actuals vs budget and portfolio trend reporting
