import PropertyCard from '@/components/PropertyCard'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { AssetMetric, DebtLoan, Property, parseOccupancy } from '@/lib/types'

export const dynamic = 'force-dynamic'

async function getProperties(): Promise<Property[]> {
  const { data, error } = await getSupabaseAdmin().from('properties').select('*').order('property_name')

  if (error) {
    console.error('Error fetching properties:', error.message)
    return []
  }

  return data ?? []
}

async function getAssetMetrics(): Promise<AssetMetric[]> {
  const { data, error } = await getSupabaseAdmin().from('asset_metrics').select('*')

  if (error) {
    console.error('Error fetching asset metrics:', error.message)
    return []
  }

  return data ?? []
}

async function getDebtSchedule(): Promise<DebtLoan[]> {
  const { data, error } = await getSupabaseAdmin().from('debt_schedule').select('*')

  if (error) {
    console.error('Error fetching debt schedule:', error.message)
    return []
  }

  return data ?? []
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function PortfolioPage() {
  const [properties, assetMetrics, debtLoans] = await Promise.all([getProperties(), getAssetMetrics(), getDebtSchedule()])

  const occupancyValues = properties
    .map((property) => parseOccupancy(property.occupancy_rate))
    .filter((value): value is number => value !== null)

  const avgOccupancy = occupancyValues.length
    ? Math.round(occupancyValues.reduce((sum, value) => sum + value, 0) / occupancyValues.length)
    : 0

  const fullOccupancy = properties.filter((property) => parseOccupancy(property.occupancy_rate) === 100).length
  const belowEighty = properties.filter((property) => {
    const occupancy = parseOccupancy(property.occupancy_rate)
    return occupancy !== null && occupancy < 80
  }).length

  const totalDebtBalance = debtLoans.reduce((sum, loan) => sum + (loan.loan_balance ?? 0), 0)
  const totalDebtService = debtLoans.reduce((sum, loan) => sum + (loan.debt_service ?? 0), 0)
  const dscValues = debtLoans.map((loan) => loan.dsc_market).filter((value): value is number => value !== null)
  const avgDsc = dscValues.length
    ? dscValues.reduce((sum, value) => sum + value, 0) / dscValues.length
    : null

  const debtByPropertyId = new Map<string, DebtLoan[]>()
  for (const loan of debtLoans) {
    if (!loan.property_id) continue
    const existing = debtByPropertyId.get(loan.property_id) ?? []
    existing.push(loan)
    debtByPropertyId.set(loan.property_id, existing)
  }

  const assetByPropertyId = new Map<string, AssetMetric>()
  for (const metric of assetMetrics) {
    assetByPropertyId.set(metric.property_id, metric)
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">Anchor Investments - Property Portfolio</h1>
        <p className="mt-2 text-sm text-slate-400">Commercial real estate operations dashboard</p>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-4">
          <p className="text-2xl font-semibold text-slate-100">{properties.length}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Total Properties</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-4">
          <p className="text-2xl font-semibold text-slate-100">{avgOccupancy}%</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Average Occupancy</p>
        </div>
        <div className="rounded-xl border border-indigo-700/50 bg-indigo-950/30 p-4">
          <p className="text-2xl font-semibold text-indigo-300">{formatCurrency(totalDebtBalance)}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-indigo-200/80">Total Debt Balance</p>
        </div>
        <div className="rounded-xl border border-cyan-700/50 bg-cyan-950/30 p-4">
          <p className="text-2xl font-semibold text-cyan-300">{formatCurrency(totalDebtService)}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-cyan-200/80">Annual Debt Service</p>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-700/50 bg-emerald-950/30 p-4">
          <p className="text-2xl font-semibold text-emerald-300">{fullOccupancy}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-emerald-200/80">Count At 100%</p>
        </div>
        <div className="rounded-xl border border-rose-700/50 bg-rose-950/30 p-4">
          <p className="text-2xl font-semibold text-rose-300">{belowEighty}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-rose-200/80">Count Below 80%</p>
        </div>
        <div className="rounded-xl border border-violet-700/50 bg-violet-950/30 p-4">
          <p className="text-2xl font-semibold text-violet-300">{avgDsc ? avgDsc.toFixed(2) : 'N/A'}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-violet-200/80">Average DSCR</p>
        </div>
      </section>

      {properties.length === 0 ? (
        <section className="rounded-xl border border-slate-800 bg-slate-900/75 p-8 text-center">
          <p className="text-lg font-semibold text-slate-200">No properties found in Supabase.</p>
          <p className="mt-2 text-sm text-slate-400">Seed the portfolio data with:</p>
          <code className="mt-4 inline-block rounded bg-slate-950 px-3 py-2 text-sm text-slate-300">npm run seed</code>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {properties.map((property) => {
            const loans = debtByPropertyId.get(property.id) ?? []
            const assetMetric = assetByPropertyId.get(property.id)
            const totalLoanBalanceForProperty = loans.reduce((sum, loan) => sum + (loan.loan_balance ?? 0), 0)
            const nextMaturityDate = loans
              .map((loan) => loan.maturity_date)
              .filter((date): date is string => Boolean(date))
              .sort()[0] ?? null

            return (
              <PropertyCard
                key={property.id}
                property={property}
                debtSummary={{
                  loanCount: loans.length,
                  totalLoanBalance: totalLoanBalanceForProperty,
                  nextMaturityDate,
                }}
                assetSummary={{
                  capRate: assetMetric?.cap_rate ?? null,
                  dscr: assetMetric?.dscr ?? null,
                }}
              />
            )
          })}
        </section>
      )}
    </div>
  )
}
