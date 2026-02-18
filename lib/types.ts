export interface Property {
  id: string
  property_name: string
  date_acquired: string | null
  original_investment_thesis: string | null
  owners_intent_10yr: string | null
  general_notes: string | null
  occupancy_rate: string | null
  market_psf_rate: string | null
  avg_psf_rate: string | null
  leasing_strategy: string | null
  vacancies: string | null
  tenant_mix: string | null
  renewals: string | null
  risks: string | null
  capex_budget: Record<string, string> | null
  capex_outlook_summary: string | null
  long_term_items: string | null
  created_at: string
  updated_at: string
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function parseOccupancy(rate: string | null): number | null {
  if (!rate) return null
  const cleaned = rate.replace('%', '').trim()
  const value = Number.parseFloat(cleaned)
  return Number.isFinite(value) ? value : null
}

export function occupancyBadge(rate: string | null): string {
  const pct = parseOccupancy(rate)
  if (pct === null) return 'bg-slate-700 text-slate-200 border border-slate-600'
  if (pct >= 100) return 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
  if (pct >= 80) return 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
  return 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
}

export function nextCapex(
  budget: Record<string, string> | null
): { year: string; amount: string } | null {
  if (!budget) return null
  const currentYear = new Date().getFullYear()
  const nextYear = Object.keys(budget)
    .map((year) => Number.parseInt(year, 10))
    .filter((year) => Number.isFinite(year) && year >= currentYear)
    .sort((a, b) => a - b)[0]

  if (!nextYear) return null
  return { year: String(nextYear), amount: budget[String(nextYear)] ?? 'N/A' }
}

function extractDateFromText(input: string): Date | null {
  const match = input.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
  if (!match) return null

  const month = Number.parseInt(match[1], 10)
  const day = Number.parseInt(match[2], 10)
  const yearRaw = Number.parseInt(match[3], 10)
  const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw

  const parsed = new Date(year, month - 1, day)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function firstUpcomingRenewal(renewals: string | null): string | null {
  if (!renewals) return null

  const lines = renewals
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (!lines.length) return null

  const now = new Date()
  const dated = lines
    .map((line) => ({ line, date: extractDateFromText(line) }))
    .filter((entry): entry is { line: string; date: Date } => entry.date !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const upcoming = dated.find((entry) => entry.date >= now)
  if (upcoming) return upcoming.line

  return dated[0]?.line ?? lines[0]
}
