# Task: Extend Anchor Dashboard with Debt + Asset Management Data

## CRITICAL
**READ-ONLY access to Google Sheets - do NOT edit them!**

## Your Mission
Extend the Anchor Property Dashboard with debt schedule and asset management data from two new sources.

## Sources
1. **Asset Management Dashboard** (Google Sheet)
   - Spreadsheet ID: `1x59kako3WWzknXpNP0JNyGjMH2DJ9Q2lW333WSK4cgE`
   - 28 property sheets (one tab per property)
   - Read with: `gog sheets get <id> '<SheetName>!A1:Z100' --account jdelk@anchorinv.com --client default --json`

2. **Debt Schedule** (Excel file)
   - File: `debt-schedule.xlsx` (already downloaded, 41.3 MB)
   - Parse with `xlsx` or `exceljs` npm package

## Steps
1. Extract data from both sources → save to `data/` folder
2. Create property name mapping → `data/property-mapping.json`
3. Extend Supabase schema → add `asset_metrics` and `debt_schedule` tables
4. Update Next.js UI → show metrics on property pages + new dashboard views
5. Seed Supabase with extracted data
6. Push to GitHub + deploy to Vercel
7. Test

## Existing Setup
- Next.js 14 + Tailwind + Supabase
- 28 properties in `properties` table
- GitHub: https://github.com/fostercreighton2926/anchor-dashboard
- Vercel: auto-deploys on push

## When Done
Run: `openclaw system event --text "Done: Anchor Dashboard extended" --mode now`
