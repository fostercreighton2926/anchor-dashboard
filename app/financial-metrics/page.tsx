import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { AssetMetric, DebtLoan, formatCurrency, formatPercent } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface PropertyMetricRow {
  property_name: string
  noi: number | null
  cap_rate: number | null
  dscr: number | null
  debt_balance: number
  debt_service: number
}

async function getAssetMetrics(): Promise<Array<AssetMetric & { properties: { property_name: string } | null }>> {
  const { data, error } = await getSupabaseAdmin().from('asset_metrics').select('*, properties(property_name)')

  if (error) {
    console.error('Error fetching asset metrics:', error.message)
    return []
  }

  return (data ?? []) as Array<AssetMetric & { properties: { property_name: string } | null }>
}

async function getDebtLoans(): Promise<Array<DebtLoan & { properties: { property_name: string } | null }>> {
  const { data, error } = await getSupabaseAdmin().from('debt_schedule').select('*, properties(property_name)')

  if (error) {
    console.error('Error fetching debt schedule:', error.message)
    return []
  }

  return (data ?? []) as Array<DebtLoan & { properties: { property_name: string } | null }>
}

export default async function FinancialMetricsPage() {
  const [assets, debtLoans] = await Promise.all([getAssetMetrics(), getDebtLoans()])

  const debtByPropertyName = new Map<string, { debt_balance: number; debt_service: number; dscrValues: number[] }>()
  for (const loan of debtLoans) {
    const propertyName = loan.properties?.property_name
    if (!propertyName) continue

    const existing = debtByPropertyName.get(propertyName) ?? { debt_balance: 0, debt_service: 0, dscrValues: [] }
    existing.debt_balance += loan.loan_balance ?? 0
    existing.debt_service += loan.debt_service ?? 0
    if (loan.dsc_market !== null) {
      existing.dscrValues.push(loan.dsc_market)
    }
    debtByPropertyName.set(propertyName, existing)
  }

  const propertyRows: PropertyMetricRow[] = assets.map((asset) => {
    const propertyName = asset.properties?.property_name ?? 'Unknown'
    const debt = debtByPropertyName.get(propertyName)
    const inferredDscr = debt && debt.dscrValues.length > 0
      ? debt.dscrValues.reduce((sum, value) => sum + value, 0) / debt.dscrValues.length
      : null

    return {
      property_name: propertyName,
      noi: asset.noi_ttm,
      cap_rate: asset.cap_rate,
      dscr: asset.dscr ?? inferredDscr,
      debt_balance: debt?.debt_balance ?? 0,
      debt_service: debt?.debt_service ?? 0,
    }
  })

  const portfolioNoi = propertyRows.reduce((sum, row) => sum + (row.noi ?? 0), 0)
  const portfolioDebtBalance = propertyRows.reduce((sum, row) => sum + row.debt_balance, 0)
  const portfolioDebtService = propertyRows.reduce((sum, row) => sum + row.debt_service, 0)

  const capRates = propertyRows.map((row) => row.cap_rate).filter((value): value is number => value !== null)
  const avgCapRate = capRates.length ? capRates.reduce((sum, value) => sum + value, 0) / capRates.length : null

  const dscValues = propertyRows.map((row) => row.dscr).filter((value): value is number => value !== null)
  const avgDscr = dscValues.length ? dscValues.reduce((sum, value) => sum + value, 0) / dscValues.length : null

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Financial Metrics</h1>
          <p className="mt-2 text-sm text-slate-400">Portfolio NOI, cap rate, and debt service coverage</p>
        </div>
        <Link href="/" className="text-sm text-slate-300 transition hover:text-white">
          Back to portfolio
        </Link>
      </div>

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-4">
          <p className="text-xl font-semibold text-slate-100">{formatCurrency(portfolioNoi)}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Portfolio NOI</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-4">
          <p className="text-xl font-semibold text-slate-100">{formatPercent(avgCapRate, 2)}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Average Cap Rate</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-4">
          <p className="text-xl font-semibold text-slate-100">{avgDscr ? avgDscr.toFixed(2) : 'N/A'}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Average DSCR</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-4">
          <p className="text-xl font-semibold text-slate-100">{formatCurrency(portfolioDebtBalance)}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Debt Balance</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-4">
          <p className="text-xl font-semibold text-slate-100">{formatCurrency(portfolioDebtService)}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Debt Service</p>
        </div>
      </section>

      <section className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/75 p-4">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left">
              <th className="py-2 font-medium text-slate-400">Property</th>
              <th className="py-2 font-medium text-slate-400">NOI</th>
              <th className="py-2 font-medium text-slate-400">Cap Rate</th>
              <th className="py-2 font-medium text-slate-400">DSCR</th>
              <th className="py-2 font-medium text-slate-400">Debt Balance</th>
              <th className="py-2 font-medium text-slate-400">Debt Service</th>
            </tr>
          </thead>
          <tbody>
            {propertyRows
              .sort((a, b) => a.property_name.localeCompare(b.property_name))
              .map((row) => (
                <tr key={row.property_name} className="border-b border-slate-800 text-slate-200">
                  <td className="py-2">{row.property_name}</td>
                  <td className="py-2">{formatCurrency(row.noi)}</td>
                  <td className="py-2">{formatPercent(row.cap_rate, 2)}</td>
                  <td className="py-2">{row.dscr?.toFixed(2) ?? 'N/A'}</td>
                  <td className="py-2">{formatCurrency(row.debt_balance)}</td>
                  <td className="py-2">{formatCurrency(row.debt_service)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
