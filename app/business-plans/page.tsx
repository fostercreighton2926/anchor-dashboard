import ExecutiveOverviewClient from '@/components/dashboard/ExecutiveOverviewClient'
import { getCapexProjects, getUpcomingCapEx } from '@/lib/capex'
import { buildPropertyRollups, calculatePortfolioStats, monthsBetween } from '@/lib/portfolio'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { AssetMetric, DebtLoan, Property, slugify } from '@/lib/types'

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

async function getDebtSchedule(): Promise<Array<DebtLoan & { properties: { property_name: string } | null }>> {
  const { data, error } = await getSupabaseAdmin().from('debt_schedule').select('*, properties(property_name)')
  if (error) {
    console.error('Error fetching debt schedule:', error.message)
    return []
  }
  return (data ?? []) as Array<DebtLoan & { properties: { property_name: string } | null }>
}

export default async function PortfolioPage() {
  const [properties, assetMetrics, debtLoans] = await Promise.all([getProperties(), getAssetMetrics(), getDebtSchedule()])
  const rollups = buildPropertyRollups(properties, assetMetrics, debtLoans)
  const stats = calculatePortfolioStats(rollups)
  const capexProjects = getCapexProjects()

  const rows = rollups.map((rollup) => {
    const matchingLoan = debtLoans.find((loan) => loan.property_id === rollup.property.id)
    const nextCapex = capexProjects
      .filter((project) => project.propertyName === rollup.property.property_name)
      .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime())[0]

    return {
      id: rollup.property.id,
      propertyName: rollup.property.property_name,
      occupancy: rollup.occupancy,
      noi: rollup.assetMetric?.noi_ttm ?? 0,
      capRate: rollup.assetMetric?.cap_rate ?? null,
      dscr: rollup.avgDscr ?? rollup.assetMetric?.dscr ?? null,
      debtBalance: rollup.debtBalance,
      debtService: rollup.debtService,
      nextMaturityDate: rollup.nextMaturityDate,
      lender: matchingLoan?.lender ?? 'Unknown',
      nextCapex: nextCapex ? `${nextCapex.project} (${nextCapex.status})` : null,
      slug: slugify(rollup.property.property_name),
    }
  })

  const debtSoon = rows
    .filter((row) => row.nextMaturityDate && monthsBetween(new Date(), new Date(row.nextMaturityDate)) <= 6)
    .map((row) => `${row.propertyName} (${row.nextMaturityDate})`)

  const dscrConcern = rows
    .filter((row) => row.dscr !== null && row.dscr < 1.3)
    .map((row) => `${row.propertyName} (${row.dscr?.toFixed(2)})`)

  const capexSoon = getUpcomingCapEx(90).filter((project) => project.budget > 100000).map((project) => `${project.propertyName}: ${project.project}`)

  return (
    <ExecutiveOverviewClient
      stats={{
        portfolioValue: stats.portfolioValueEstimate,
        annualNoi: stats.annualNoi,
        totalDebt: stats.totalDebt,
        weightedDscr: stats.weightedAvgDscr,
        occupancy: stats.weightedAvgOccupancy,
      }}
      rows={rows}
      alerts={{ debtSoon, dscrConcern, capexSoon }}
    />
  )
}
