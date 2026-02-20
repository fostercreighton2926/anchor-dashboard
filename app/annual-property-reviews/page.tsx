import ExecutiveOverviewClient from '@/components/dashboard/ExecutiveOverviewClient'
import { operationalDashboardProperties } from '@/lib/operationalDashboardData'
import { slugify } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default function PortfolioPage() {
  const rows = operationalDashboardProperties.map((property) => ({
    id: slugify(property.name),
    propertyName: property.name,
    occupancy: property.occupancy >= 0 ? property.occupancy : null,
    noi: property.noi2025 ?? 0,
    capRate: null,
    dscr: property.dsc ?? null,
    debtBalance: property.loanBal ?? 0,
    debtService: property.debtService ?? 0,
    nextMaturityDate: property.maturity ?? null,
    lender: 'Operational dashboard',
    nextCapex: property.capex2026 > 0 ? `2026 budget (${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.capex2026)})` : null,
    slug: slugify(property.name),
  }))

  const totalDebt = rows.reduce((sum, row) => sum + row.debtBalance, 0)
  const annualNoi = rows.reduce((sum, row) => sum + row.noi, 0)
  const weightedDscrDenominator = rows.reduce((sum, row) => sum + row.debtService, 0)
  const weightedDscr = weightedDscrDenominator > 0 ? annualNoi / weightedDscrDenominator : null
  const occRows = rows.filter((row) => row.occupancy !== null)
  const occupancy = occRows.length ? occRows.reduce((sum, row) => sum + (row.occupancy ?? 0), 0) / occRows.length : null
  const portfolioValue = annualNoi > 0 ? annualNoi / 0.075 : 0

  return (
    <ExecutiveOverviewClient
      stats={{
        portfolioValue,
        annualNoi,
        totalDebt,
        weightedDscr,
        occupancy,
      }}
      rows={rows}
    />
  )
}
