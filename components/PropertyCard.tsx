import Link from 'next/link'
import GaugeChart from '@/components/GaugeChart'
import HealthBadge from '@/components/HealthBadge'
import { getDscrHealth, getOccupancyHealth } from '@/lib/health'
import { Property, formatCurrency, parseOccupancy, slugify } from '@/lib/types'

interface PropertyCardDebtSummary {
  loanCount: number
  totalLoanBalance: number
  nextMaturityDate: string | null
}

interface PropertyCardAssetSummary {
  capRate: number | null
  dscr: number | null
  noiTtm?: number | null
}

function formatPercent(value: number | null, decimals = 1): string {
  if (value === null || !Number.isFinite(value)) return 'N/A'
  const normalized = value <= 1 ? value * 100 : value
  return `${normalized.toFixed(decimals)}%`
}

function countdown(date: string | null): string {
  if (!date) return 'No maturity'
  const now = new Date()
  const end = new Date(date)
  if (Number.isNaN(end.getTime())) return 'No maturity'
  const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth())
  if (months <= 0) return 'Due now'
  return `${months} months`
}

export default function PropertyCard({
  property,
  debtSummary,
  assetSummary,
  nextCapex,
}: {
  property: Property
  debtSummary?: PropertyCardDebtSummary
  assetSummary?: PropertyCardAssetSummary
  nextCapex?: string | null
}) {
  const occupancy = parseOccupancy(property.occupancy_rate)
  const occupancyHealth = getOccupancyHealth(occupancy)
  const dscrHealth = getDscrHealth(assetSummary?.dscr ?? null)

  return (
    <Link
      href={`/properties/${slugify(property.property_name)}`}
      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#7A9A8A]/45 hover:bg-[#7A9A8A]/6"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex h-16 w-full items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 text-2xl">
            🏢
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{property.property_name}</h3>
        </div>
        <GaugeChart value={occupancy} label="Occupancy" size={78} />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <HealthBadge tone={occupancyHealth.tone} label={`Occupancy ${occupancy === null ? 'N/A' : `${occupancy.toFixed(0)}%`}`} emoji="👥" />
        <HealthBadge tone={dscrHealth.tone} label={`DSCR ${assetSummary?.dscr?.toFixed(2) ?? 'N/A'}`} emoji="🏦" />
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">NOI</p>
          <p className="mt-1 text-slate-800">{formatCurrency(assetSummary?.noiTtm ?? null)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Debt</p>
          <p className="mt-1 text-slate-800">{formatCurrency(debtSummary?.totalLoanBalance ?? null)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Cap Rate</p>
          <p className="mt-1 text-slate-800">{formatPercent(assetSummary?.capRate ?? null, 2)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Maturity</p>
          <p className="mt-1 text-slate-800">⏰ {countdown(debtSummary?.nextMaturityDate ?? null)}</p>
        </div>
      </div>

      <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        🔧 Next CapEx: {nextCapex ?? 'Not scheduled'}
      </p>
    </Link>
  )
}
