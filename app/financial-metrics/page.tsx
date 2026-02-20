import FinancialMetricsClient from '@/components/dashboard/FinancialMetricsClient'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { AssetMetric, DebtLoan, Property, parseOccupancy, slugify } from '@/lib/types'

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

async function getDebtLoans(): Promise<Array<DebtLoan & { properties: { property_name: string } | null }>> {
  const { data, error } = await getSupabaseAdmin().from('debt_schedule').select('*, properties(property_name)')

  if (error) {
    console.error('Error fetching debt schedule:', error.message)
    return []
  }

  return (data ?? []) as Array<DebtLoan & { properties: { property_name: string } | null }>
}

export default async function FinancialMetricsPage() {
  const [properties, assets, debtLoans] = await Promise.all([getProperties(), getAssetMetrics(), getDebtLoans()])

  const assetByPropertyId = new Map<string, AssetMetric>()
  for (const asset of assets) {
    assetByPropertyId.set(asset.property_id, asset)
  }

  const debtByPropertyId = new Map<string, { debtService: number; cashFlow: number; recoverable: number; dscrValues: number[] }>()
  for (const loan of debtLoans) {
    if (!loan.property_id) continue
    const row = debtByPropertyId.get(loan.property_id) ?? { debtService: 0, cashFlow: 0, recoverable: 0, dscrValues: [] }
    row.debtService += loan.debt_service ?? 0
    row.cashFlow += loan.cash_flow ?? 0
    row.recoverable += loan.total_recoverable_opex ?? 0
    if (loan.dsc_market !== null) row.dscrValues.push(loan.dsc_market)
    debtByPropertyId.set(loan.property_id, row)
  }

  const rows = properties.map((property) => {
    const asset = assetByPropertyId.get(property.id)
    const debt = debtByPropertyId.get(property.id)
    const avgDebtDscr = debt && debt.dscrValues.length ? debt.dscrValues.reduce((sum, val) => sum + val, 0) / debt.dscrValues.length : null

    return {
      id: property.id,
      propertyName: property.property_name,
      noi: asset?.noi_ttm ?? 0,
      capRate: asset?.cap_rate ?? null,
      dscr: asset?.dscr ?? avgDebtDscr,
      occupancy: parseOccupancy(property.occupancy_rate),
      debtService: debt?.debtService ?? 0,
      cashFlow: debt?.cashFlow ?? 0,
      recoverableOpex: debt?.recoverable ?? 0,
      slug: slugify(property.property_name),
    }
  })

  return <FinancialMetricsClient rows={rows} />
}
