'use client'

import { useMemo, useState } from 'react'
import HealthBadge from '@/components/HealthBadge'
import StatCard from '@/components/StatCard'
import { TimelineChart } from '@/components/charts/SimpleCharts'
import { getDscrHealth } from '@/lib/health'
import { colorForTone, maturityCountdown, riskAction, sortByUrgency } from '@/lib/portfolio'

interface DebtViewRow {
  id: string
  property: string
  lender: string
  balance: number
  debtService: number
  dscr: number | null
  interestRate: number | null
  maturityDate: string | null
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function formatDate(date: string | null): string {
  if (!date) return 'N/A'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'N/A'
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DebtOverviewClient({ loans }: { loans: DebtViewRow[] }) {
  const [propertyFilter, setPropertyFilter] = useState('all')
  const [lenderFilter, setLenderFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [scope, setScope] = useState<'all' | 'due12' | 'troubled'>('all')

  const properties = ['all', ...Array.from(new Set(loans.map((loan) => loan.property))).sort()]
  const lenders = ['all', ...Array.from(new Set(loans.map((loan) => loan.lender))).sort()]
  const years = ['all', ...Array.from(new Set(loans.map((loan) => loan.maturityDate ? String(new Date(loan.maturityDate).getFullYear()) : 'Unknown'))).sort()]

  const filtered = useMemo(() => {
    const base = loans
      .filter((loan) => (propertyFilter === 'all' ? true : loan.property === propertyFilter))
      .filter((loan) => (lenderFilter === 'all' ? true : loan.lender === lenderFilter))
      .filter((loan) => {
        if (yearFilter === 'all') return true
        if (!loan.maturityDate) return yearFilter === 'Unknown'
        return String(new Date(loan.maturityDate).getFullYear()) === yearFilter
      })
      .filter((loan) => {
        if (scope === 'all') return true
        if (scope === 'troubled') return (loan.dscr ?? 9) < 1.3
        if (!loan.maturityDate) return false
        const months = (new Date(loan.maturityDate).getFullYear() - new Date().getFullYear()) * 12 + (new Date(loan.maturityDate).getMonth() - new Date().getMonth())
        return months <= 12
      })

    const urgencyReady = base.map((loan) => ({
      ...loan,
      maturity_date: loan.maturityDate,
      dsc_market: loan.dscr,
      loan_balance: loan.balance,
    }))

    return sortByUrgency(urgencyReady)
  }, [loans, propertyFilter, lenderFilter, yearFilter, scope])

  const totalDebt = filtered.reduce((sum, loan) => sum + loan.balance, 0)
  const avgRate = filtered.length
    ? filtered.reduce((sum, loan) => sum + (loan.interestRate ?? 0), 0) / filtered.length
    : 0
  const nextMaturity = filtered
    .map((loan) => loan.maturityDate)
    .filter((date): date is string => Boolean(date))
    .sort()[0] ?? null

  const timelineRows = filtered.slice(0, 20).map((loan) => {
    const monthsToMaturity = loan.maturityDate
      ? Math.max(0, (new Date(loan.maturityDate).getFullYear() - new Date().getFullYear()) * 12 + (new Date(loan.maturityDate).getMonth() - new Date().getMonth()))
      : 120

    return {
      label: loan.property,
      startMonth: 0,
      endMonth: Math.min(120, monthsToMaturity),
      color: colorForTone(getDscrHealth(loan.dscr).tone),
      valueLabel: formatCurrency(loan.balance),
    }
  })

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">🏦 Debt Overview</h1>
        <p className="mt-2 text-sm text-slate-400">Timeline visualization and refinancing priority queue</p>
      </header>

      <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard emoji="💰" label="Total Debt" value={formatCurrency(totalDebt)} tone="blue" trendLabel="Current filtered exposure" />
        <StatCard emoji="📉" label="Avg Interest Rate" value={`${avgRate.toFixed(2)}%`} tone="yellow" trendLabel="Weighted by loan count" />
        <StatCard emoji="📅" label="Next Maturity" value={formatDate(nextMaturity)} tone="red" trendLabel={maturityCountdown(nextMaturity)} />
        <StatCard emoji="🏢" label="Properties With Debt" value={String(new Set(filtered.map((loan) => loan.property)).size)} tone="green" trendLabel="Distinct assets" />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[300px_1fr]">
        <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm font-semibold text-slate-100">Filters</p>
          <div className="mt-3 space-y-3 text-sm">
            <label className="block text-slate-400">Property
              <select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-slate-200" value={propertyFilter} onChange={(e) => setPropertyFilter(e.target.value)}>
                {properties.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="block text-slate-400">Lender
              <select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-slate-200" value={lenderFilter} onChange={(e) => setLenderFilter(e.target.value)}>
                {lenders.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="block text-slate-400">Maturity Year
              <select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-slate-200" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                {years.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="block text-slate-400">Scope
              <select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-slate-200" value={scope} onChange={(e) => setScope(e.target.value as 'all' | 'due12' | 'troubled')}>
                <option value="all">all</option>
                <option value="due12">due in 12mo</option>
                <option value="troubled">troubled (DSCR &lt; 1.3)</option>
              </select>
            </label>
          </div>
        </aside>

        <TimelineChart title="Debt Maturity Timeline (0-10 years)" rows={timelineRows} />
      </section>

      <section className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-100">⚠️ Refinancing Priority Queue</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="py-2">🏢 Property</th>
              <th className="py-2">🏦 Lender</th>
              <th className="py-2">💰 Balance</th>
              <th className="py-2">📅 Maturity</th>
              <th className="py-2">📊 DSCR</th>
              <th className="py-2">⚠️ Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((loan) => {
              const health = getDscrHealth(loan.dscr)
              return (
                <tr key={loan.id} className="border-b border-slate-800 text-slate-200">
                  <td className="py-2">{loan.property}</td>
                  <td className="py-2">{loan.lender}</td>
                  <td className="py-2">{formatCurrency(loan.balance)}</td>
                  <td className="py-2">{formatDate(loan.maturityDate)} ({maturityCountdown(loan.maturityDate)})</td>
                  <td className="py-2"><HealthBadge tone={health.tone} emoji={health.emoji} label={loan.dscr?.toFixed(2) ?? 'N/A'} /></td>
                  <td className="py-2">{riskAction({ maturity_date: loan.maturityDate, dsc_market: loan.dscr })}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}
