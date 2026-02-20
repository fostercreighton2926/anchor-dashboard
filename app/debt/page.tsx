import DebtOverviewClient from '@/components/dashboard/DebtOverviewClient'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { DebtLoan } from '@/lib/types'

export const dynamic = 'force-dynamic'

async function getDebtLoans(): Promise<Array<DebtLoan & { properties: { property_name: string } | null }>> {
  const { data, error } = await getSupabaseAdmin()
    .from('debt_schedule')
    .select('*, properties(property_name)')
    .order('maturity_date', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('Error fetching debt loans:', error.message)
    return []
  }

  return (data ?? []) as Array<DebtLoan & { properties: { property_name: string } | null }>
}

export default async function DebtOverviewPage() {
  const loans = await getDebtLoans()

  const viewRows = loans.map((loan) => ({
    id: loan.id,
    property: loan.properties?.property_name ?? loan.source_property_name,
    lender: loan.lender ?? 'Unknown',
    balance: loan.loan_balance ?? 0,
    debtService: loan.debt_service ?? 0,
    dscr: loan.dsc_market,
    interestRate: loan.current_rate,
    maturityDate: loan.maturity_date,
  }))

  return <DebtOverviewClient loans={viewRows} />
}
