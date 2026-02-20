'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import AlertBanner from '@/components/AlertBanner'
import PropertyCard from '@/components/PropertyCard'
import StatCard from '@/components/StatCard'
import { BarChartCard, PieChartCard } from '@/components/charts/SimpleCharts'
import { getDscrHealth, getOccupancyHealth } from '@/lib/health'
import { colorForTone } from '@/lib/portfolio'

interface RollupView {
  id: string
  propertyName: string
  occupancy: number | null
  noi: number
  capRate: number | null
  dscr: number | null
  debtBalance: number
  debtService: number
  nextMaturityDate: string | null
  lender: string
  nextCapex: string | null
  slug: string
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export default function ExecutiveOverviewClient({
  stats,
  rows,
  alerts,
}: {
  stats: {
    portfolioValue: number
    annualNoi: number
    totalDebt: number
    weightedDscr: number | null
    occupancy: number | null
  }
  rows: RollupView[]
  alerts: {
    debtSoon: string[]
    dscrConcern: string[]
    capexSoon: string[]
  }
}) {
  const [sortMode, setSortMode] = useState<'alphabetical' | 'highestNoi' | 'lowestDscr'>('alphabetical')
  const [compositionMode, setCompositionMode] = useState<'value' | 'sf'>('value')

  const sortedRows = useMemo(() => {
    if (sortMode === 'highestNoi') return [...rows].sort((a, b) => b.noi - a.noi)
    if (sortMode === 'lowestDscr') return [...rows].sort((a, b) => (a.dscr ?? 9) - (b.dscr ?? 9))
    return [...rows].sort((a, b) => a.propertyName.localeCompare(b.propertyName))
  }, [rows, sortMode])

  const noiChart = sortedRows.map((row) => ({
    label: row.propertyName,
    value: Math.max(0, Math.round(row.noi)),
    color: colorForTone(getDscrHealth(row.dscr).tone),
    href: `/properties/${row.slug}`,
  }))

  const debtByLender = Array.from(
    rows.reduce((map, row) => map.set(row.lender, (map.get(row.lender) ?? 0) + row.debtBalance), new Map<string, number>()).entries()
  )
    .map(([label, value]) => ({ label, value, color: '#3b82f6' }))
    .sort((a, b) => b.value - a.value)

  const composition = rows.map((row) => ({
    label: row.propertyName,
    value: compositionMode === 'value' ? Math.max(0, row.capRate && row.capRate > 0 ? row.noi / row.capRate : row.noi) : Math.max(1, row.noi / 40),
  }))

  const occupancyDist = [
    { label: '>95%', value: rows.filter((r) => (r.occupancy ?? 0) > 95).length, color: '#10b981' },
    { label: '85-95%', value: rows.filter((r) => (r.occupancy ?? 0) >= 85 && (r.occupancy ?? 0) <= 95).length, color: '#f59e0b' },
    { label: '<85%', value: rows.filter((r) => (r.occupancy ?? 0) < 85).length, color: '#ef4444' },
  ]

  const debtTone = getDscrHealth(stats.weightedDscr).tone
  const occTone = getOccupancyHealth(stats.occupancy).tone

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 md:py-8">
      <header>
        <h1 className="text-2xl font-semibold text-white md:text-3xl">📊 Executive Overview</h1>
        <p className="mt-1 text-sm text-slate-400">Visual portfolio health across debt, NOI, occupancy, and CapEx.</p>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard emoji="🏢" label="Portfolio Value" value={formatCurrency(stats.portfolioValue)} trend="up" trendLabel="Estimated from NOI / cap rates" tone="blue" />
        <StatCard emoji="💰" label="Total Annual NOI" value={formatCurrency(stats.annualNoi)} trend={stats.annualNoi > 0 ? 'up' : 'flat'} trendLabel="Income engine" tone={stats.annualNoi > 0 ? 'green' : 'yellow'} />
        <StatCard emoji="🏦" label="Total Debt Exposure" value={formatCurrency(stats.totalDebt)} trend="flat" trendLabel={`Weighted DSCR ${stats.weightedDscr?.toFixed(2) ?? 'N/A'}`} tone={debtTone} />
        <StatCard emoji="👥" label="Portfolio Occupancy" value={`${stats.occupancy?.toFixed(1) ?? 'N/A'}%`} trend="flat" trendLabel="Weighted average" tone={occTone} />
      </section>

      <section className="space-y-3">
        <AlertBanner title="Debt maturing in <6 months" items={alerts.debtSoon} tone="red" icon="🚨" />
        <AlertBanner title="Properties with DSCR <1.3" items={alerts.dscrConcern} tone="yellow" icon="⚠️" />
        <AlertBanner title="Major CapEx due in next 90 days" items={alerts.capexSoon} tone="blue" icon="🔧" />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <BarChartCard
            title="NOI by Property"
            data={noiChart}
            onSortToggle={() => setSortMode((prev) => (prev === 'alphabetical' ? 'highestNoi' : prev === 'highestNoi' ? 'lowestDscr' : 'alphabetical'))}
            sortLabel={sortMode}
          />
          <PieChartCard title="Debt by Lender" data={debtByLender} />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">Portfolio Composition</h3>
              <button
                className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:border-slate-500"
                onClick={() => setCompositionMode((prev) => (prev === 'value' ? 'sf' : 'value'))}
              >
                Toggle: {compositionMode}
              </button>
            </div>
            <PieChartCard title={compositionMode === 'value' ? 'By estimated value' : 'By square footage proxy'} data={composition} />
          </div>
          <PieChartCard title="Occupancy Distribution" data={occupancyDist} donut />
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link href="/debt" className="rounded-xl border border-blue-500/50 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">📅 View Debt Maturity Timeline</Link>
        <Link href="/capex" className="rounded-xl border border-blue-500/50 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">🔧 View CapEx Schedule</Link>
        <Link href="/financial-metrics" className="rounded-xl border border-blue-500/50 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">📊 Financial Metrics Dashboard</Link>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {rows.map((row) => (
          <PropertyCard
            key={row.id}
            property={{
              id: row.id,
              property_name: row.propertyName,
              date_acquired: null,
              original_investment_thesis: null,
              owners_intent_10yr: null,
              general_notes: null,
              occupancy_rate: row.occupancy === null ? null : `${row.occupancy}%`,
              market_psf_rate: null,
              avg_psf_rate: null,
              leasing_strategy: null,
              vacancies: null,
              tenant_mix: null,
              renewals: null,
              risks: null,
              capex_budget: null,
              capex_outlook_summary: null,
              long_term_items: null,
              created_at: '',
              updated_at: '',
            }}
            debtSummary={{
              loanCount: row.debtBalance > 0 ? 1 : 0,
              totalLoanBalance: row.debtBalance,
              nextMaturityDate: row.nextMaturityDate,
            }}
            assetSummary={{
              capRate: row.capRate,
              dscr: row.dscr,
              noiTtm: row.noi,
            }}
            nextCapex={row.nextCapex}
          />
        ))}
      </section>
    </div>
  )
}
