import Link from 'next/link'
import { notFound } from 'next/navigation'
import PropertyDetailTabs from '@/components/dashboard/PropertyDetailTabs'
import { getCapexProjects } from '@/lib/capex'
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
  const properties = await getProperties()
  return properties.map((property) => ({ slug: slugify(property.property_name) }))
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const property = await getPropertyBySlug(slug)
  if (!property) notFound()

  const [assetMetric, debtLoans] = await Promise.all([getAssetMetric(property.id), getDebtLoans(property.id)])

  const capexProjects = getCapexProjects().filter((project) => project.propertyName === property.property_name)

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <Link href="/" className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-300 hover:border-slate-500 hover:text-white">
        Back to portfolio
      </Link>

      <div className="mt-4">
        <PropertyDetailTabs
          property={property}
          dscr={assetMetric?.dscr ?? null}
          noi={assetMetric?.noi_ttm ?? null}
          capRate={assetMetric?.cap_rate ?? null}
          debtLoans={debtLoans}
          capexProjects={capexProjects}
        />
      </div>
    </div>
  )
}
