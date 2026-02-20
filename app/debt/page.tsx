import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { DebtLoan, formatCurrency } from '@/lib/types'

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

function formatDate(date: string | null): string {
  if (!date) return 'N/A'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'N/A'
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function DebtOverviewPage() {
  const loans = await getDebtLoans()

  const totalBalance = loans.reduce((sum, loan) => sum + (loan.loan_balance ?? 0), 0)
  const totalDebtService = loans.reduce((sum, loan) => sum + (loan.debt_service ?? 0), 0)

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Debt Overview</h1>
          <p className="mt-2 text-sm text-slate-400">All loans sorted by maturity date</p>
        </div>
        <Link href="/" className="text-sm text-slate-300 transition hover:text-white">
          Back to portfolio
        </Link>
      </div>

      <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-4">
          <p className="text-2xl font-semibold text-slate-100">{loans.length}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Loans</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-4">
          <p className="text-2xl font-semibold text-slate-100">{formatCurrency(totalBalance)}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Total Loan Balance</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-4">
          <p className="text-2xl font-semibold text-slate-100">{formatCurrency(totalDebtService)}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Annual Debt Service</p>
        </div>
      </section>

      <section className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/75 p-4">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left">
              <th className="py-2 font-medium text-slate-400">Property</th>
              <th className="py-2 font-medium text-slate-400">Source Name</th>
              <th className="py-2 font-medium text-slate-400">Lender</th>
              <th className="py-2 font-medium text-slate-400">Loan Balance</th>
              <th className="py-2 font-medium text-slate-400">Debt Service</th>
              <th className="py-2 font-medium text-slate-400">DSCR</th>
              <th className="py-2 font-medium text-slate-400">Maturity</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id} className="border-b border-slate-800 text-slate-200">
                <td className="py-2">{loan.properties?.property_name ?? 'Unmapped'}</td>
                <td className="py-2">{loan.source_property_name}</td>
                <td className="py-2">{loan.lender ?? 'N/A'}</td>
                <td className="py-2">{formatCurrency(loan.loan_balance)}</td>
                <td className="py-2">{formatCurrency(loan.debt_service)}</td>
                <td className="py-2">{loan.dsc_market?.toFixed(2) ?? 'N/A'}</td>
                <td className="py-2">{formatDate(loan.maturity_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
