'use client'

import { useState } from 'react'
import GaugeChart from '@/components/GaugeChart'
import HealthBadge from '@/components/HealthBadge'
import { TimelineChart } from '@/components/charts/SimpleCharts'
import { CapexProject } from '@/lib/capex'
import { getCapexPriorityHealth, getDscrHealth, getOccupancyHealth } from '@/lib/health'
import { DebtLoan, Property, formatCurrency, formatPercent, parseOccupancy } from '@/lib/types'

const tabs = ['Overview', 'Debt Schedule', 'CapEx Timeline', 'Tenants', 'Financials'] as const

function formatDate(date: string | null): string {
  if (!date) return 'N/A'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'N/A'
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PropertyDetailTabs({
  property,
  dscr,
  noi,
  capRate,
  debtLoans,
  capexProjects,
}: {
  property: Property
  dscr: number | null
  noi: number | null
  capRate: number | null
  debtLoans: DebtLoan[]
  capexProjects: CapexProject[]
}) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Overview')

  const occupancy = parseOccupancy(property.occupancy_rate)
  const dscrHealth = getDscrHealth(dscr)
  const occupancyHealth = getOccupancyHealth(occupancy)
  const nextMaturity = debtLoans.map((loan) => loan.maturity_date).filter((d): d is string => Boolean(d)).sort()[0] ?? null
  const nextCapex = capexProjects.slice().sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime())[0]

  const capexTimelineRows = capexProjects.map((project) => {
    const now = new Date()
    const start = Math.max(0, (new Date(project.plannedDate).getFullYear() - now.getFullYear()) * 12 + (new Date(project.plannedDate).getMonth() - now.getMonth()))
    const end = Math.max(start + 1, (new Date(project.dueDate).getFullYear() - now.getFullYear()) * 12 + (new Date(project.dueDate).getMonth() - now.getMonth()))
    const health = getCapexPriorityHealth(project.priority)
    const color = health.tone === 'red' ? '#ef4444' : health.tone === 'yellow' ? '#f59e0b' : health.tone === 'green' ? '#10b981' : '#3b82f6'
    return {
      label: project.project,
      startMonth: start,
      endMonth: Math.min(36, end),
      color,
      valueLabel: formatCurrency(project.budget),
    }
  })

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-[140px_1fr]">
          <div className="flex h-28 items-center justify-center rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 text-4xl">
            🏢
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white md:text-3xl">{property.property_name}</h1>
            <p className="mt-1 text-sm text-slate-400">{property.date_acquired ? `Acquired ${property.date_acquired}` : 'Address not yet available in source data'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <HealthBadge tone={occupancyHealth.tone} label={`Occupancy ${occupancy === null ? 'N/A' : `${occupancy.toFixed(1)}%`}`} emoji="👥" />
              <HealthBadge tone={dscrHealth.tone} label={`DSCR ${dscr?.toFixed(2) ?? 'N/A'}`} emoji="🏦" />
              <HealthBadge tone={nextMaturity ? 'yellow' : 'blue'} label={`⏰ ${nextMaturity ? formatDate(nextMaturity) : 'No debt maturity'}`} />
              <HealthBadge tone={nextCapex ? getCapexPriorityHealth(nextCapex.priority).tone : 'blue'} label={`🔧 ${nextCapex?.project ?? 'No project scheduled'}`} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <GaugeChart value={occupancy} label="Occupancy" />
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">NOI</p>
            <p className="mt-2 text-xl font-semibold text-slate-100">{formatCurrency(noi)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Cap Rate</p>
            <p className="mt-2 text-xl font-semibold text-slate-100">{formatPercent(capRate, 2)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Debt Loans</p>
            <p className="mt-2 text-xl font-semibold text-slate-100">{debtLoans.length}</p>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`rounded-lg border px-3 py-2 text-sm ${activeTab === tab ? 'border-blue-500 bg-blue-500/20 text-blue-100' : 'border-slate-700 bg-slate-900/70 text-slate-300'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </section>

      {activeTab === 'Overview' ? (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-slate-100">📝 Investment Thesis</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-300">{property.original_investment_thesis ?? 'Not provided'}</p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-slate-100">📅 Owner Intent (10-year)</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-300">{property.owners_intent_10yr ?? 'Not provided'}</p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-slate-100">🚨 Risks</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-300">{property.risks ?? 'Not provided'}</p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-slate-100">📊 Market Rate Comparison</h2>
            <p className="mt-2 text-sm text-slate-300">Property Avg PSF: {property.avg_psf_rate ?? 'N/A'}</p>
            <p className="mt-1 text-sm text-slate-300">Market PSF: {property.market_psf_rate ?? 'N/A'}</p>
          </article>
        </section>
      ) : null}

      {activeTab === 'Debt Schedule' ? (
        <section className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-slate-400">
                <th className="py-2">Lender</th>
                <th className="py-2">Balance</th>
                <th className="py-2">Debt Service</th>
                <th className="py-2">DSCR</th>
                <th className="py-2">Rate</th>
                <th className="py-2">Maturity</th>
              </tr>
            </thead>
            <tbody>
              {debtLoans.map((loan) => {
                const health = getDscrHealth(loan.dsc_market)
                return (
                  <tr key={loan.id} className="border-b border-slate-800 text-slate-200">
                    <td className="py-2">{loan.lender ?? 'N/A'}</td>
                    <td className="py-2">{formatCurrency(loan.loan_balance)}</td>
                    <td className="py-2">{formatCurrency(loan.debt_service)}</td>
                    <td className="py-2"><HealthBadge tone={health.tone} emoji={health.emoji} label={loan.dsc_market?.toFixed(2) ?? 'N/A'} /></td>
                    <td className="py-2">{loan.interest_rate_label ?? (loan.current_rate ? `${loan.current_rate.toFixed(2)}%` : 'N/A')}</td>
                    <td className="py-2">{formatDate(loan.maturity_date)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      ) : null}

      {activeTab === 'CapEx Timeline' ? (
        <section className="space-y-4">
          <TimelineChart title="Property CapEx Timeline" rows={capexTimelineRows} />
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left text-slate-400">
                  <th className="py-2">Project</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Budget</th>
                  <th className="py-2">Planned</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {capexProjects.map((project) => {
                  const health = getCapexPriorityHealth(project.priority)
                  return (
                    <tr key={project.id} className="border-b border-slate-800 text-slate-200">
                      <td className="py-2">{project.project}</td>
                      <td className="py-2"><HealthBadge tone={health.tone} label={project.category} emoji={health.emoji} /></td>
                      <td className="py-2">{formatCurrency(project.budget)}</td>
                      <td className="py-2">{formatDate(project.plannedDate)}</td>
                      <td className="py-2">{project.status}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeTab === 'Tenants' ? (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm text-slate-300">Tenant-level dataset is not fully parsed yet. Current extracted notes:</p>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-400">{property.tenant_mix ?? 'No tenant details available in source.'}</p>
          <p className="mt-3 whitespace-pre-line text-sm text-slate-400">Renewals: {property.renewals ?? 'No renewals provided.'}</p>
        </section>
      ) : null}

      {activeTab === 'Financials' ? (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">NOI</p>
              <p className="mt-1 text-lg text-slate-100">{formatCurrency(noi)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Cap Rate</p>
              <p className="mt-1 text-lg text-slate-100">{formatPercent(capRate, 2)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">DSCR</p>
              <p className="mt-1 text-lg text-slate-100">{dscr?.toFixed(2) ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Recoverable OpEx</p>
              <p className="mt-1 text-lg text-slate-100">{formatCurrency(debtLoans.reduce((sum, loan) => sum + (loan.total_recoverable_opex ?? 0), 0))}</p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
