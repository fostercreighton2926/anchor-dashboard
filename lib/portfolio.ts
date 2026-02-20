import { AssetMetric, DebtLoan, Property, parseOccupancy } from '@/lib/types'

export interface LoanWithProperty {
  maturity_date: string | null
  dsc_market: number | null
  loan_balance: number | null
  lender?: string | null
  propertyName?: string
}

export interface PropertyRollup {
  property: Property
  assetMetric: AssetMetric | null
  loans: DebtLoan[]
  occupancy: number | null
  debtBalance: number
  debtService: number
  avgDscr: number | null
  nextMaturityDate: string | null
}

export interface PortfolioStats {
  propertyCount: number
  portfolioValueEstimate: number
  annualNoi: number
  totalDebt: number
  weightedAvgDscr: number | null
  weightedAvgOccupancy: number | null
  totalDebtService: number
}

export function calculatePortfolioStats(rollups: PropertyRollup[]): PortfolioStats {
  let totalNoi = 0
  let totalDebt = 0
  let totalDebtService = 0
  let totalValue = 0
  let weightedDscrNumerator = 0
  let weightedDscrDenominator = 0
  let weightedOccupancyNumerator = 0
  let weightedOccupancyDenominator = 0

  for (const rollup of rollups) {
    const noi = rollup.assetMetric?.noi_ttm ?? 0
    const capRate = rollup.assetMetric?.cap_rate ?? null

    totalNoi += noi
    totalDebt += rollup.debtBalance
    totalDebtService += rollup.debtService

    if (capRate !== null && capRate > 0 && noi > 0) {
      totalValue += noi / capRate
    }

    if (rollup.avgDscr !== null && rollup.debtBalance > 0) {
      weightedDscrNumerator += rollup.avgDscr * rollup.debtBalance
      weightedDscrDenominator += rollup.debtBalance
    }

    if (rollup.occupancy !== null) {
      const weight = noi > 0 ? noi : 1
      weightedOccupancyNumerator += rollup.occupancy * weight
      weightedOccupancyDenominator += weight
    }
  }

  return {
    propertyCount: rollups.length,
    portfolioValueEstimate: totalValue,
    annualNoi: totalNoi,
    totalDebt,
    weightedAvgDscr: weightedDscrDenominator > 0 ? weightedDscrNumerator / weightedDscrDenominator : null,
    weightedAvgOccupancy: weightedOccupancyDenominator > 0 ? weightedOccupancyNumerator / weightedOccupancyDenominator : null,
    totalDebtService,
  }
}

export function buildPropertyRollups(
  properties: Property[],
  assets: AssetMetric[],
  loans: DebtLoan[]
): PropertyRollup[] {
  const assetByPropertyId = new Map<string, AssetMetric>()
  const loansByPropertyId = new Map<string, DebtLoan[]>()

  for (const asset of assets) {
    if (!assetByPropertyId.has(asset.property_id)) {
      assetByPropertyId.set(asset.property_id, asset)
    }
  }

  for (const loan of loans) {
    if (!loan.property_id) continue
    const list = loansByPropertyId.get(loan.property_id) ?? []
    list.push(loan)
    loansByPropertyId.set(loan.property_id, list)
  }

  return properties.map((property) => {
    const propertyLoans = loansByPropertyId.get(property.id) ?? []
    const debtBalance = propertyLoans.reduce((sum, loan) => sum + (loan.loan_balance ?? 0), 0)
    const debtService = propertyLoans.reduce((sum, loan) => sum + (loan.debt_service ?? 0), 0)
    const dscrValues = propertyLoans.map((loan) => loan.dsc_market).filter((v): v is number => v !== null)
    const avgDscr = dscrValues.length ? dscrValues.reduce((sum, v) => sum + v, 0) / dscrValues.length : null
    const nextMaturityDate = propertyLoans
      .map((loan) => loan.maturity_date)
      .filter((date): date is string => Boolean(date))
      .sort()[0] ?? null

    return {
      property,
      assetMetric: assetByPropertyId.get(property.id) ?? null,
      loans: propertyLoans,
      occupancy: parseOccupancy(property.occupancy_rate),
      debtBalance,
      debtService,
      avgDscr,
      nextMaturityDate,
    }
  })
}

export function sortByUrgency<T extends LoanWithProperty>(loans: T[]): T[] {
  const now = Date.now()

  const score = (loan: T) => {
    const maturityMs = loan.maturity_date ? new Date(loan.maturity_date).getTime() : now + 15 * 365 * 24 * 3600 * 1000
    const daysToMaturity = Math.max(0, (maturityMs - now) / (24 * 3600 * 1000))
    const dscr = loan.dsc_market ?? 1.6
    const size = loan.loan_balance ?? 0

    const maturityScore = Math.max(0, 1000 - daysToMaturity)
    const dscrScore = dscr < 1.25 ? 500 : dscr < 1.5 ? 250 : 0
    const sizeScore = size / 100000

    return maturityScore + dscrScore + sizeScore
  }

  return [...loans].sort((a, b) => score(b) - score(a))
}

export function getDebtHealth(dscr: number | null): 'red' | 'yellow' | 'green' | 'blue' {
  if (dscr === null || !Number.isFinite(dscr)) return 'blue'
  if (dscr < 1.25) return 'red'
  if (dscr < 1.5) return 'yellow'
  return 'green'
}

export function getOccupancyHealth(rate: number | null): 'red' | 'yellow' | 'green' | 'blue' {
  if (rate === null || !Number.isFinite(rate)) return 'blue'
  if (rate < 85) return 'red'
  if (rate < 95) return 'yellow'
  return 'green'
}

export function filterLoans(
  loans: LoanWithProperty[],
  options: {
    lender?: string
    propertyName?: string
    maturityYear?: string
    scope?: 'all' | 'due12' | 'troubled'
  }
): LoanWithProperty[] {
  return loans.filter((loan) => {
    if (options.lender && options.lender !== 'all' && (loan.lender ?? 'Unknown') !== options.lender) return false
    if (options.propertyName && options.propertyName !== 'all' && loan.propertyName !== options.propertyName) return false

    const maturityDate = loan.maturity_date ? new Date(loan.maturity_date) : null
    const maturityYear = maturityDate ? String(maturityDate.getFullYear()) : 'Unknown'

    if (options.maturityYear && options.maturityYear !== 'all' && maturityYear !== options.maturityYear) return false

    if (options.scope === 'due12') {
      if (!maturityDate) return false
      const months = monthsBetween(new Date(), maturityDate)
      if (months > 12) return false
    }

    if (options.scope === 'troubled' && (loan.dsc_market ?? 9) >= 1.3) return false

    return true
  })
}

export function monthsBetween(from: Date, to: Date): number {
  const yearDiff = to.getFullYear() - from.getFullYear()
  const monthDiff = to.getMonth() - from.getMonth()
  return yearDiff * 12 + monthDiff
}

export function maturityCountdown(date: string | null): string {
  if (!date) return 'No maturity'
  const months = monthsBetween(new Date(), new Date(date))
  if (months <= 0) return 'Due now'
  return `${months} months`
}

export function riskAction(loan: { maturity_date: string | null; dsc_market: number | null }): string {
  const maturity = loan.maturity_date ? monthsBetween(new Date(), new Date(loan.maturity_date)) : 120
  const dscr = loan.dsc_market ?? 1.6

  if (maturity <= 6 || dscr < 1.25) return 'Refinance now'
  if (maturity <= 12 || dscr < 1.4) return 'Monitor'
  return 'On track'
}

export function colorForTone(tone: 'red' | 'yellow' | 'green' | 'blue'): string {
  if (tone === 'red') return '#ef4444'
  if (tone === 'yellow') return '#f59e0b'
  if (tone === 'green') return '#10b981'
  return '#3b82f6'
}
