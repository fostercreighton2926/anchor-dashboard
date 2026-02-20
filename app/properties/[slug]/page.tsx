import Link from 'next/link'
import { notFound } from 'next/navigation'
import PropertyDetailTabs from '@/components/dashboard/PropertyDetailTabs'
import { getCapexProjects } from '@/lib/capex'
import { findOperationalPropertyBySlug, operationalDashboardProperties } from '@/lib/operationalDashboardData'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { AssetMetric, DebtLoan, Property, slugify } from '@/lib/types'

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
  const { data, error } = await getSupabaseAdmin().from('asset_metrics').select('*').eq('property_id', propertyId).maybeSingle()

  if (error) {
    console.error('Error fetching asset metric:', error.message)
    return null
  }

  return data
}

async function getDebtLoans(propertyId: string): Promise<DebtLoan[]> {
  const { data, error } = await getSupabaseAdmin().from('debt_schedule').select('*').eq('property_id', propertyId).order('maturity_date', { ascending: true })

  if (error) {
    console.error('Error fetching debt loans:', error.message)
    return []
  }

  return data ?? []
}

export async function generateStaticParams() {
  return operationalDashboardProperties.map((property) => ({ slug: slugify(property.name) }))
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [property, operationalProperty] = await Promise.all([getPropertyBySlug(slug), Promise.resolve(findOperationalPropertyBySlug(slug))])
  if (!property && !operationalProperty) notFound()

  const [assetMetric, debtLoans] = property ? await Promise.all([getAssetMetric(property.id), getDebtLoans(property.id)]) : [null, []]
  const displayName = operationalProperty?.name ?? property?.property_name ?? ''

  const capexProjects = getCapexProjects().filter((project) => project.propertyName === displayName)
  const propertyForReview: Property = property
    ? {
        ...property,
        property_name: displayName,
        occupancy_rate: operationalProperty && operationalProperty.occupancy >= 0 ? `${operationalProperty.occupancy}%` : property.occupancy_rate,
        original_investment_thesis: operationalProperty?.strategy ?? property.original_investment_thesis,
        owners_intent_10yr: operationalProperty?.strategy ?? property.owners_intent_10yr,
        tenant_mix: operationalProperty?.tenant ?? property.tenant_mix,
        risks: operationalProperty?.risks ?? property.risks,
      }
    : {
        id: slug,
        property_name: displayName,
        date_acquired: null,
        original_investment_thesis: operationalProperty?.strategy ?? null,
        owners_intent_10yr: operationalProperty?.strategy ?? null,
        general_notes: null,
        occupancy_rate: operationalProperty && operationalProperty.occupancy >= 0 ? `${operationalProperty.occupancy}%` : null,
        market_psf_rate: null,
        avg_psf_rate: null,
        leasing_strategy: operationalProperty?.strategy ?? null,
        vacancies: null,
        tenant_mix: operationalProperty?.tenant ?? null,
        renewals: null,
        risks: operationalProperty?.risks ?? null,
        capex_budget: null,
        capex_outlook_summary: null,
        long_term_items: null,
        created_at: '',
        updated_at: '',
      }

  const debtLoansForReview: DebtLoan[] = operationalProperty
    ? [
        {
          id: `${slug}-op-loan`,
          property_id: property?.id ?? null,
          external_loan_key: `${slug}-op`,
          source_property_name: displayName,
          loan_name: `${displayName} Loan`,
          lender: 'Operational dashboard',
          loan_type: operationalProperty.rateType,
          square_feet: operationalProperty.sqft ?? null,
          base_rent: null,
          additional_rent: null,
          total_rent: null,
          recoverable_opex_psf: null,
          total_recoverable_opex: null,
          opex_2025: null,
          noi_today: operationalProperty.noi2025 ?? null,
          noi_budget: null,
          loan_balance: operationalProperty.loanBal ?? null,
          debt_service: operationalProperty.debtService ?? null,
          dsc_market: operationalProperty.dsc ?? null,
          dsc_budget: null,
          dsc_requirement: null,
          cash_flow: operationalProperty.cf2026 ?? null,
          as_of_825: null,
          monthly_payment: null,
          interest_rate: operationalProperty.rate ?? null,
          interest_rate_label: operationalProperty.rateType && Number.isFinite(operationalProperty.rate) ? `${operationalProperty.rateType} ${operationalProperty.rate.toFixed(2)}%` : null,
          rate_margin: null,
          current_rate: operationalProperty.rate ?? null,
          maturity_date: operationalProperty.maturity ?? null,
          origination_date: null,
          notes: operationalProperty.rateReset ?? null,
          ml_notes: null,
          eli_notes: operationalProperty.risks ?? null,
          raw_payload: null,
          created_at: '',
          updated_at: '',
        },
      ]
    : debtLoans

  return (
    <div className="bg-slate-50 px-4 py-6 md:px-8 md:py-8">
      <Link href="/annual-property-reviews" className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-[#7A9A8A]/45 hover:bg-[#7A9A8A]/10">
        Back to annual property reviews
      </Link>

      <div className="mt-4">
        <PropertyDetailTabs
          property={propertyForReview}
          dscr={operationalProperty?.dsc ?? assetMetric?.dscr ?? null}
          noi={operationalProperty?.noi2025 ?? assetMetric?.noi_ttm ?? null}
          capRate={assetMetric?.cap_rate ?? null}
          debtLoans={debtLoansForReview}
          capexProjects={capexProjects}
        />
      </div>
    </div>
  )
}
