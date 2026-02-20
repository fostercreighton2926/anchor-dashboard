# Anchor Dashboard - Data Extension Plan

## CRITICAL: READ-ONLY ACCESS TO GOOGLE SHEETS
**DO NOT edit, delete, or modify the Google Sheets sources. READ ONLY.**

## Data Sources

### 1. Asset Management Dashboard (Google Sheet)
- **Spreadsheet ID:** 1x59kako3WWzknXpNP0JNyGjMH2DJ9Q2lW333WSK4cgE
- **Structure:** 28 property-specific sheets (one tab per property)
- **Access:** Use gog sheets API (jdelk@anchorinv.com, client: default)
- **Read with:** `gog sheets get <spreadsheetId> '<SheetName>!A1:Z100' --account jdelk@anchorinv.com --client default --json`

### 2. Debt Schedule (Excel file - 41.3 MB)
- **Location:** `/Users/fostercreighton/.openclaw/workspace/anchor-dashboard/debt-schedule.xlsx`
- **Format:** XLSX (multi-sheet workbook)
- **Note:** This is a COPY for extraction - original is untouched in Google Drive

## Task Overview

1. **Extract asset management data** from all 28 property sheets
2. **Parse debt schedule** from Excel file
3. **Map property names** across sources (they may vary)
4. **Extend Supabase schema** with new tables
5. **Update Next.js dashboard** to display the new data
6. **Deploy updates** to Vercel

## Step 1: Data Extraction

### Asset Management Dashboard
For each property sheet:
- Read the data range (likely A1:Z100 or similar)
- Extract key metrics (look for: occupancy, NOI, cap rate, leasing metrics, tenant info, etc.)
- Document the schema in `data/asset-management-schema.json`
- Export to `data/asset-management.json`

### Debt Schedule
- Parse Excel file (use a library like `xlsx` or `exceljs`)
- Extract loan details per property: loan amount, interest rate, maturity date, lender, debt service, etc.
- Document schema in `data/debt-schedule-schema.json`
- Export to `data/debt-schedule.json`

## Step 2: Property Name Mapping
Create `data/property-mapping.json` to unify property names across:
- properties.json (existing 28 properties)
- Asset Management Dashboard sheet names
- Debt Schedule property references

Example:
```json
{
  "Cumberland": {
    "existing": "Cumberland",
    "asset_mgmt_sheet": "Cumberland",
    "debt_schedule_name": "Cumberland Plaza"
  }
}
```

## Step 3: Supabase Schema Extension

Create new tables:
- `asset_metrics` (one row per property, updated metrics)
- `debt_schedule` (one row per loan, multiple loans per property possible)

Link via `property_id` foreign key to existing `properties` table.

## Step 4: Dashboard UI Updates

Extend the dashboard to show:
- Asset performance metrics on property detail pages
- Debt service summary on each property card
- New "Debt Overview" page (all loans, sorted by maturity date)
- Financial metrics dashboard (NOI, cap rate, debt service coverage)

## Step 5: Deployment

- Seed new tables with extracted data
- Push to GitHub
- Deploy to Vercel
- Test all pages

## Expected Deliverables

1. `data/asset-management.json` - extracted data
2. `data/debt-schedule.json` - extracted debt info
3. `data/property-mapping.json` - name unification
4. `data/asset-management-schema.json` - schema doc
5. `data/debt-schedule-schema.json` - schema doc
6. Updated Supabase migrations
7. Updated Next.js pages/components
8. Deployed live site

## Notes
- Be cautious with property name variations (e.g., "Trousdale" vs "Trousdale Commons")
- Some properties may not have debt (check for nulls)
- Asset metrics may be time-series (latest snapshot only for MVP)
- Keep existing properties.json data intact (don't overwrite)
