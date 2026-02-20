import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { AssetMetric, DebtLoan, Property, formatCurrency, formatPercent, occupancyBadge, slugify } from '@/lib/types'

export const dynamic = 'force-dynamic'

async function getProperties(): Promise<Property[]> {
  const { data, error } = await getSupabaseAdmin().from('properties').select('*').order('property_name')
  if (error) {
    console.error('Error fetching property details:', error.message)
    return []
  }
  return data ?? []
}

async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const properties = await getProperties()
  return properties.find((property) => slugify(property.property_name) === slug) ?? null
}

async function getAssetMetric(propertyId: string): Promise<AssetMetric | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('asset_metrics')
    .select('*')
    .eq('property_id', propertyId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching asset metric:', error.message)
    return null
  }

  return data
}

async function getDebtLoans(propertyId: string): Promise<DebtLoan[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('debt_schedule')
    .select('*')
    .eq('property_id', propertyId)
    .order('maturity_date', { ascending: true })

  if (error) {
    console.error('Error fetching debt loans:', error.message)
    return []
  }

  return data ?? []
}

function formatDate(date: string | null): string {
  if (!date) return 'N/A'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'N/A'
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export async function generateStaticParams() {
  const properties = await getProperties()
  return properties.map((property) => ({ slug: slugify(property.property_name) }))
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const property = await getPropertyBySlug(slug)
  if (!property) notFound()

  const [assetMetric, debtLoans] = await Promise.all([getAssetMetric(property.id), getDebtLoans(property.id)])

  const capexItems = property.capex_budget
    ? Object.entries(property.capex_budget).sort(([a], [b]) => Number.parseInt(a, 10) - Number.parseInt(b, 10))
    : []

  const totalLoanBalance = debtLoans.reduce((sum, loan) => sum + (loan.loan_balance ?? 0), 0)
  const totalDebtService = debtLoans.reduce((sum, loan) => sum + (loan.debt_service ?? 0), 0)

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <Link href="/" className="inline-flex items-center text-sm text-slate-300 transition hover:text-white">
        Back to portfolio
      </Link>

      <header className="mb-8 mt-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">{property.property_name}</h1>
          <p className="mt-2 text-sm text-slate-400">Date acquired: {property.date_acquired ?? 'Not provided'}</p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1.5 text-sm font-semibold ${occupancyBadge(property.occupancy_rate)}`}>
          Occupancy: {property.occupancy_rate ?? 'N/A'}
        </span>
      </header>

      <div className="space-y-5">
        <section className="rounded-xl border border-slate-800 bg-slate-900/75 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Asset + Debt Snapshot</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">NOI (TTM)</p>
              <p className="mt-1 text-slate-100">{formatCurrency(assetMetric?.noi_ttm ?? null)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Cap Rate</p>
              <p className="mt-1 text-slate-100">{formatPercent(assetMetric?.cap_rate ?? null, 2)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">DSCR</p>
              <p className="mt-1 text-slate-100">{assetMetric?.dscr?.toFixed(2) ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Debt Balance</p>
              <p className="mt-1 text-slate-100">{formatCurrency(totalLoanBalance)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Annual Debt Service</p>
              <p className="mt-1 text-slate-100">{formatCurrency(totalDebtService)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Market PSF</p>
              <p className="mt-1 text-slate-100">{formatCurrency(assetMetric?.market_psf ?? null)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Average PSF</p>
              <p className="mt-1 text-slate-100">{formatCurrency(assetMetric?.avg_psf ?? null)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Metric Source</p>
              <p className="mt-1 text-slate-100">{assetMetric?.source_status ?? 'N/A'}</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/75 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Debt Schedule</h2>
          {debtLoans.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-left">
                    <th className="py-2 font-medium text-slate-400">Lender</th>
                    <th className="py-2 font-medium text-slate-400">Loan Balance</th>
                    <th className="py-2 font-medium text-slate-400">Debt Service</th>
                    <th className="py-2 font-medium text-slate-400">DSCR</th>
                    <th className="py-2 font-medium text-slate-400">Rate</th>
                    <th className="py-2 font-medium text-slate-400">Maturity</th>
                  </tr>
                </thead>
                <tbody>
                  {debtLoans.map((loan) => (
                    <tr key={loan.id} className="border-b border-slate-800 text-slate-200">
                      <td className="py-2">{loan.lender ?? 'N/A'}</td>
                      <td className="py-2">{formatCurrency(loan.loan_balance)}</td>
                      <td className="py-2">{formatCurrency(loan.debt_service)}</td>
                      <td className="py-2">{loan.dsc_market?.toFixed(2) ?? 'N/A'}</td>
                      <td className="py-2">{loan.interest_rate_label ?? loan.current_rate?.toFixed(4) ?? 'N/A'}</td>
                      <td className="py-2">{formatDate(loan.maturity_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No debt schedule entries for this property.</p>
          )}
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/75 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Overview</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Occupancy</p>
              <p className="mt-1 text-slate-100">{property.occupancy_rate ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Market PSF Rate</p>
              <p className="mt-1 text-slate-100">{property.market_psf_rate ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Average PSF Rate</p>
              <p className="mt-1 text-slate-100">{property.avg_psf_rate ?? 'N/A'}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Risks</p>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-200">{property.risks ?? 'Not provided'}</p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/75 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Leasing</h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Leasing Strategy</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-200">{property.leasing_strategy ?? 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Tenant Mix</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-200">{property.tenant_mix ?? 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Vacancies</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-200">{property.vacancies ?? 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Renewals</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-200">{property.renewals ?? 'Not provided'}</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/75 p-5">
          <h2 className="text-lg font-semibold text-slate-100">CapEx</h2>
          {capexItems.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-2 text-left font-medium text-slate-400">Year</th>
                    <th className="py-2 text-right font-medium text-slate-400">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {capexItems.map(([year, amount]) => (
                    <tr key={year} className="border-b border-slate-800">
                      <td className="py-2 text-slate-200">{year}</td>
                      <td className="py-2 text-right text-slate-200">{amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No CapEx budget data provided.</p>
          )}
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">CapEx Outlook Summary</p>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-200">{property.capex_outlook_summary ?? 'Not provided'}</p>
          </div>
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Long-Term Items</p>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-200">{property.long_term_items ?? 'Not provided'}</p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/75 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Notes</h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Original Investment Thesis</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-200">{property.original_investment_thesis ?? 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Owner&apos;s Intent (10 Year)</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-200">{property.owners_intent_10yr ?? 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">General Notes</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-200">{property.general_notes ?? 'Not provided'}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
