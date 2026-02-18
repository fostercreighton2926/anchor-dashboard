# Anchor Investments - Property Dashboard

A Next.js + Supabase dashboard for managing the Anchor commercial real estate portfolio.

## What It Is

- Portfolio overview with occupancy, CapEx, and renewal data for all 28 properties
- Individual property pages with full detail: leasing strategy, tenant mix, CapEx schedule, investment notes
- Built to grow: schema includes scaffolded tables for tenants, leases, and loans (Phase 2)

## Setup

### 1. Environment Variables

Create `.env.local` in the project root (already done if Jarvis set this up):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

### 2. Run the Database Migration

In your Supabase project dashboard, go to SQL Editor and paste the contents of:
```
supabase/migrations/001_initial.sql
```

Run it to create the tables.

### 3. Seed the Database

```bash
npm run seed
```

This loads all 28 properties from `data/properties.json` into Supabase.

### 4. Run the Dev Server

```bash
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Push the project to a GitHub repo
2. Go to vercel.com and import the repo
3. Add environment variables in the Vercel dashboard (same as `.env.local`)
4. Deploy - Vercel auto-detects Next.js

## Roadmap

### Phase 1 (current)
- Portfolio overview dashboard
- Individual property pages
- Data from 2025 Annual Business Plans

### Phase 2 - Tenant Tracking
- Tenant profiles with contacts
- Lease records (suite, sq ft, PSF, dates, options)
- Renewal calendar view

### Phase 3 - Financial
- Loan tracking (lender, balance, rate, maturity)
- CapEx tracking vs actuals
- NOI / cash flow summaries

### Phase 4 - Operations
- Document storage per property
- Maintenance log
- PM contact directory
- Investor reporting
