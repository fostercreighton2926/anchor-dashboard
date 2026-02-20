'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import GaugeChart from '@/components/GaugeChart'
import HealthBadge from '@/components/HealthBadge'
import StatCard from '@/components/StatCard'
import { LineChartCard, ScatterChartCard } from '@/components/charts/SimpleCharts'
import { getDscrHealth, getOccupancyHealth } from '@/lib/health'

interface MetricRow {
  id: string
  propertyName: string
  noi: number
  capRate: number | null
  dscr: number | null
  occupancy: number | null
  debtService: number
  cashFlow: number
  recoverableOpex: number
  slug: string
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export default function FinancialMetricsClient({ rows }: { rows: MetricRow[] }) {
  const [sortKey, setSortKey] = useState<'property' | 'noi' | 'dscr' | 'occupancy'>('property')

  const sorted = useMemo(() => {
    const next = [...rows]
    if (sortKey === 'noi') next.sort((a, b) => b.noi - a.noi)
    else if (sortKey === 'dscr') next.sort((a, b) => (a.dscr ?? 9) - (b.dscr ?? 9))
    else if (sortKey === 'occupancy') next.sort((a, b) => (b.occupancy ?? 0) - (a.occupancy ?? 0))
    else next.sort((a, b) => a.propertyName.localeCompare(b.propertyName))
    return next
  }, [rows, sortKey])

  const totalNoi = rows.reduce((sum, row) => sum + row.noi, 0)
  const avgCapRate = rows.length ? rows.reduce((sum, row) => sum + (row.capRate ?? 0), 0) / rows.length : 0
  const avgDscr = rows.length ? rows.reduce((sum, row) => sum + (row.dscr ?? 0), 0) / rows.length : 0
  const totalDebtService = rows.reduce((sum, row) => sum + row.debtService, 0)
  const cashFlow = rows.reduce((sum, row) => sum + row.cashFlow, 0)
  const avgOccupancy = rows.length ? rows.reduce((sum, row) => sum + (row.occupancy ?? 0), 0) / rows.length : 0
  const recoverable = rows.reduce((sum, row) => sum + row.recoverableOpex, 0)

  const scatter = rows.map((row) => ({
    x: Math.max(1, row.debtService),
    y: Math.max(1, row.noi),
    label: row.propertyName,
    color: row.dscr !== null && row.dscr < 1.25 ? '#ef4444' : row.dscr !== null && row.dscr < 1.5 ? '#f59e0b' : '#10b981',
  }))

  const occupancyTrend = rows
    .slice(0, 8)
    .map((row, index) => ({ label: `P${index + 1}`, value: row.occupancy ?? 0 }))

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">📈 Financial Metrics</h1>
          <p className="mt-2 text-sm text-slate-600">Portfolio-level performance and property comparison.</p>
        </div>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4 2xl:grid-cols-7">
        <StatCard emoji="💰" label="Total NOI" value={formatCurrency(totalNoi)} tone="green" />
        <StatCard emoji="📊" label="Avg Cap Rate" value={`${(avgCapRate * 100).toFixed(2)}%`} tone="blue" />
        <StatCard emoji="🏦" label="Avg DSCR" value={avgDscr.toFixed(2)} tone={getDscrHealth(avgDscr).tone} />
        <StatCard emoji="💳" label="Debt Service" value={formatCurrency(totalDebtService)} tone="yellow" />
        <StatCard emoji="📈" label="Cash Flow" value={formatCurrency(cashFlow)} tone={cashFlow >= 0 ? 'green' : 'red'} />
        <StatCard emoji="👥" label="Avg Occupancy" value={`${avgOccupancy.toFixed(1)}%`} tone={getOccupancyHealth(avgOccupancy).tone} />
        <StatCard emoji="🧾" label="Recoverable OpEx" value={formatCurrency(recoverable)} tone="blue" />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ScatterChartCard title="NOI vs Debt Service" data={scatter} />
        <LineChartCard title="Occupancy Snapshot Trend" data={occupancyTrend} />
      </section>

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Property Comparison</h2>
          <select
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as 'property' | 'noi' | 'dscr' | 'occupancy')}
          >
            <option value="property">Sort: Property</option>
            <option value="noi">Sort: NOI</option>
            <option value="dscr">Sort: DSCR</option>
            <option value="occupancy">Sort: Occupancy</option>
          </select>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2">🏢 Property</th>
              <th className="py-2">💰 NOI</th>
              <th className="py-2">📊 Cap Rate</th>
              <th className="py-2">🏦 DSCR</th>
              <th className="py-2">👥 Occupancy</th>
              <th className="py-2">📈 Cash Flow</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const dscrHealth = getDscrHealth(row.dscr)
              const occHealth = getOccupancyHealth(row.occupancy)
              return (
                <tr key={row.id} className="border-b border-slate-100 text-slate-800">
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <GaugeChart value={row.occupancy} label="" size={44} />
                      <span>{row.propertyName}</span>
                    </div>
                  </td>
                  <td className="py-2">{formatCurrency(row.noi)}</td>
                  <td className="py-2">{row.capRate ? `${(row.capRate * 100).toFixed(2)}%` : 'N/A'}</td>
                  <td className="py-2"><HealthBadge tone={dscrHealth.tone} label={row.dscr?.toFixed(2) ?? 'N/A'} emoji={dscrHealth.emoji} /></td>
                  <td className="py-2"><HealthBadge tone={occHealth.tone} label={row.occupancy ? `${row.occupancy.toFixed(1)}%` : 'N/A'} emoji={occHealth.emoji} /></td>
                  <td className="py-2">{formatCurrency(row.cashFlow)}</td>
                  <td className="py-2">
                    <Link href={`/properties/${row.slug}`} className="rounded-lg border border-[#7A9A8A]/45 bg-white px-2 py-1 text-xs text-[#456255] shadow-sm transition hover:bg-[#7A9A8A]/10">View Details</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}
