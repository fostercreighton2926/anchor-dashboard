import Link from 'next/link'
import { Property, firstUpcomingRenewal, nextCapex, occupancyBadge, slugify } from '@/lib/types'

interface PropertyCardDebtSummary {
  loanCount: number
  totalLoanBalance: number
  nextMaturityDate: string | null
}

interface PropertyCardAssetSummary {
  capRate: number | null
  dscr: number | null
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number | null, decimals = 1): string {
  if (value === null || !Number.isFinite(value)) return 'N/A'
  const normalized = value <= 1 ? value * 100 : value
  return `${normalized.toFixed(decimals)}%`
}

function formatDate(date: string | null): string {
  if (!date) return 'N/A'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'N/A'
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PropertyCard({
  property,
  debtSummary,
  assetSummary,
}: {
  property: Property
  debtSummary?: PropertyCardDebtSummary
  assetSummary?: PropertyCardAssetSummary
}) {
  const renewal = firstUpcomingRenewal(property.renewals)
  const capex = nextCapex(property.capex_budget)

  return (
    <Link
      href={`/properties/${slugify(property.property_name)}`}
      className="group rounded-xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-slate-600 hover:bg-slate-900"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-100">{property.property_name}</h3>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${occupancyBadge(property.occupancy_rate)}`}>
          {property.occupancy_rate ?? 'N/A'}
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">First Upcoming Renewal</p>
          <p className="mt-1 text-slate-200">{renewal ?? 'Not provided'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Next CapEx</p>
          <p className="mt-1 text-slate-200">{capex ? `${capex.year}: ${capex.amount}` : 'Not provided'}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Debt Balance</p>
            <p className="mt-1 text-slate-200">
              {debtSummary ? formatCurrency(debtSummary.totalLoanBalance) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Loans</p>
            <p className="mt-1 text-slate-200">{debtSummary ? debtSummary.loanCount : 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Next Maturity</p>
            <p className="mt-1 text-slate-200">{debtSummary ? formatDate(debtSummary.nextMaturityDate) : 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Cap Rate / DSCR</p>
            <p className="mt-1 text-slate-200">
              {assetSummary
                ? `${formatPercent(assetSummary.capRate, 2)} / ${assetSummary.dscr?.toFixed(2) ?? 'N/A'}`
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
