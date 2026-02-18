import { supabaseAdmin } from '@/lib/supabase-server'
import { Property, slugify, occupancyBadgeColor } from '@/lib/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 3600

async function getProperty(slug: string): Promise<Property | null> {
  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('*')
    .order('property_name')

  if (error || !data) return null
  return data.find(p => slugify(p.property_name) === slug) || null
}

export async function generateStaticParams() {
  const { data } = await supabaseAdmin.from('properties').select('property_name')
  return (data || []).map(p => ({ slug: slugify(p.property_name) }))
}

export default async function PropertyPage({ params }: { params: { slug: string } }) {
  const property = await getProperty(params.slug)
  if (!property) notFound()

  const capexYears = property.capex_budget
    ? Object.entries(property.capex_budget).sort(([a], [b]) => parseInt(a) - parseInt(b))
    : []

  return (
    <div className="p-8 max-w-5xl">
      {/* Back */}
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6">
        <span>←</span> Back to Portfolio
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{property.property_name}</h1>
          {property.date_acquired && (
            <p className="text-gray-500 mt-1">Acquired {property.date_acquired}</p>
          )}
        </div>
        <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${occupancyBadgeColor(property.occupancy_rate)}`}>
          {property.occupancy_rate || 'N/A'} Occupied
        </span>
      </div>

      <div className="space-y-8">

        {/* Overview */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Occupancy</div>
              <div className="text-gray-900 font-semibold mt-1">{property.occupancy_rate || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Market PSF</div>
              <div className="text-gray-900 font-semibold mt-1">{property.market_psf_rate || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Avg PSF (tenants)</div>
              <div className="text-gray-900 font-semibold mt-1">{property.avg_psf_rate || 'N/A'}</div>
            </div>
          </div>
          {property.risks && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <div className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Risks</div>
              <div className="text-sm text-red-800">{property.risks}</div>
            </div>
          )}
        </section>

        {/* Leasing */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leasing</h2>
          <div className="space-y-4">
            {property.leasing_strategy && (
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Strategy</div>
                <div className="text-sm text-gray-700">{property.leasing_strategy}</div>
              </div>
            )}
            {property.vacancies && (
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Vacancies</div>
                <div className="text-sm text-gray-700">{property.vacancies}</div>
              </div>
            )}
            {property.tenant_mix && (
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Tenant Mix</div>
                <div className="text-sm text-gray-700">{property.tenant_mix}</div>
              </div>
            )}
            {property.renewals && (
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Upcoming Renewals</div>
                <div className="space-y-1">
                  {property.renewals.split('\n').filter(l => l.trim()).map((renewal, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      {renewal.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CapEx */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Capital Expenditures</h2>
          {capexYears.length > 0 && (
            <div className="mb-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs text-gray-400 uppercase tracking-wide font-medium py-2 pr-4">Year</th>
                    <th className="text-right text-xs text-gray-400 uppercase tracking-wide font-medium py-2">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {capexYears.map(([year, amount]) => (
                    <tr key={year} className="border-b border-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-700">{year}</td>
                      <td className="py-2 text-right text-gray-900">{amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {property.capex_outlook_summary && (
            <div className="mt-4">
              <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Outlook</div>
              <div className="text-sm text-gray-700 whitespace-pre-line">{property.capex_outlook_summary}</div>
            </div>
          )}
          {property.long_term_items && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
              <div className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-1">Long-Term Items to Track</div>
              <div className="text-sm text-yellow-800">{property.long_term_items}</div>
            </div>
          )}
        </section>

        {/* Notes */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes & Strategy</h2>
          <div className="space-y-5">
            {property.original_investment_thesis && (
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Investment Thesis</div>
                <div className="text-sm text-gray-700 leading-relaxed">{property.original_investment_thesis}</div>
              </div>
            )}
            {property.owners_intent_10yr && (
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Owner Intent (10-Year)</div>
                <div className="text-sm text-gray-700 leading-relaxed">{property.owners_intent_10yr}</div>
              </div>
            )}
            {property.general_notes && (
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">General Notes</div>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{property.general_notes}</div>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
