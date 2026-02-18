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
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function parseOccupancy(rate: string | null): number {
  if (!rate) return 0
  return parseFloat(rate.replace('%', '')) || 0
}

export function occupancyColor(rate: string | null): string {
  const pct = parseOccupancy(rate)
  if (pct >= 100) return 'text-green-400'
  if (pct >= 80) return 'text-yellow-400'
  return 'text-red-400'
}

export function occupancyBadgeColor(rate: string | null): string {
  const pct = parseOccupancy(rate)
  if (pct >= 100) return 'bg-green-900 text-green-300'
  if (pct >= 80) return 'bg-yellow-900 text-yellow-300'
  return 'bg-red-900 text-red-300'
}

export function nextCapex(budget: Record<string, string> | null): { year: string; amount: string } | null {
  if (!budget) return null
  const currentYear = new Date().getFullYear()
  const futureYears = Object.keys(budget)
    .filter(y => parseInt(y) >= currentYear)
    .sort()
  if (!futureYears.length) return null
  return { year: futureYears[0], amount: budget[futureYears[0]] }
}

export function firstRenewal(renewals: string | null): string | null {
  if (!renewals) return null
  const lines = renewals.split('\n').filter(l => l.trim())
  return lines[0] || null
}
