'use client'

import { useMemo, useState } from 'react'
import HealthBadge from '@/components/HealthBadge'
import StatCard from '@/components/StatCard'
import { PieChartCard, TimelineChart } from '@/components/charts/SimpleCharts'
import { CapexProject } from '@/lib/capex'
import { getCapexPriorityHealth } from '@/lib/health'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function formatDate(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'N/A'
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CapexDashboardClient({ projects }: { projects: CapexProject[] }) {
  const [propertyFilter, setPropertyFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [scope, setScope] = useState<'all' | 'critical' | 'overdue' | 'upcoming90'>('all')

  const properties = ['all', ...Array.from(new Set(projects.map((project) => project.propertyName))).sort()]
  const categories = ['all', ...Array.from(new Set(projects.map((project) => project.category))).sort()]
  const years = ['all', ...Array.from(new Set(projects.map((project) => String(new Date(project.dueDate).getFullYear())))).sort()]

  const filtered = useMemo(() => {
    const now = new Date()
    const ninety = new Date()
    ninety.setDate(now.getDate() + 90)

    return projects
      .filter((project) => (propertyFilter === 'all' ? true : project.propertyName === propertyFilter))
      .filter((project) => (categoryFilter === 'all' ? true : project.category === categoryFilter))
      .filter((project) => (yearFilter === 'all' ? true : String(new Date(project.dueDate).getFullYear()) === yearFilter))
      .filter((project) => {
        if (scope === 'all') return true
        if (scope === 'critical') return project.priority.toLowerCase() === 'critical'
        if (scope === 'overdue') return new Date(project.dueDate) < now && project.status !== 'Complete'
        if (scope === 'upcoming90') {
          const due = new Date(project.dueDate)
          return due >= now && due <= ninety
        }
        return true
      })
  }, [projects, propertyFilter, categoryFilter, yearFilter, scope])

  const currentYear = new Date().getFullYear()
  const thisYear = filtered.filter((project) => new Date(project.dueDate).getFullYear() === currentYear)
  const yearBudget = thisYear.reduce((sum, project) => sum + project.budget, 0)
  const yearSpend = thisYear.reduce((sum, project) => sum + project.actualSpend, 0)

  const now = new Date()
  const ninety = new Date()
  ninety.setDate(now.getDate() + 90)
  const upcoming90 = filtered.filter((project) => {
    const due = new Date(project.dueDate)
    return due >= now && due <= ninety
  })

  const categoryData = Array.from(
    filtered.reduce((map, project) => map.set(project.category, (map.get(project.category) ?? 0) + project.budget), new Map<string, number>()).entries()
  ).map(([label, value]) => ({ label, value }))

  const timelineRows = filtered
    .slice()
    .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime())
    .map((project) => {
      const plan = new Date(project.plannedDate)
      const due = new Date(project.dueDate)
      const start = Math.max(0, (plan.getFullYear() - now.getFullYear()) * 12 + (plan.getMonth() - now.getMonth()))
      const end = Math.max(start + 1, (due.getFullYear() - now.getFullYear()) * 12 + (due.getMonth() - now.getMonth()))
      const tone = getCapexPriorityHealth(project.priority).tone
      const color = tone === 'red' ? '#ef4444' : tone === 'yellow' ? '#f59e0b' : tone === 'green' ? '#10b981' : '#3b82f6'

      return {
        label: `${project.propertyName}: ${project.project}`,
        startMonth: start,
        endMonth: Math.min(36, end),
        color,
        valueLabel: formatCurrency(project.budget),
      }
    })

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">🔧 CapEx Schedule</h1>
        <p className="mt-2 text-sm text-slate-400">Multi-year CapEx planning with timeline and priority tracking.</p>
      </header>

      <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard emoji="💰" label="Current Year Budget" value={formatCurrency(yearBudget)} tone={yearSpend > yearBudget ? 'red' : 'green'} trendLabel={`Actual ${formatCurrency(yearSpend)}`} />
        <StatCard emoji="⏰" label="Next 90 Days" value={formatCurrency(upcoming90.reduce((sum, project) => sum + project.budget, 0))} tone="yellow" trendLabel={`${upcoming90.length} projects`} />
        <StatCard emoji="🚨" label="Largest Upcoming" value={upcoming90.length ? formatCurrency([...upcoming90].sort((a, b) => b.budget - a.budget)[0].budget) : '$0'} tone="blue" trendLabel={upcoming90.length ? [...upcoming90].sort((a, b) => b.budget - a.budget)[0].project : 'None in 90d'} />
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
            <label className="block text-slate-400">Category
              <select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-slate-200" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="block text-slate-400">Year
              <select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-slate-200" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                {years.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="block text-slate-400">Scope
              <select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-slate-200" value={scope} onChange={(e) => setScope(e.target.value as 'all' | 'critical' | 'overdue' | 'upcoming90')}>
                <option value="all">all</option>
                <option value="critical">critical</option>
                <option value="overdue">overdue</option>
                <option value="upcoming90">upcoming 90d</option>
              </select>
            </label>
          </div>
        </aside>

        <div className="space-y-4">
          <TimelineChart title="CapEx Timeline (next 3 years)" rows={timelineRows} />
          <PieChartCard title="Budget by Category" data={categoryData} />
        </div>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-100">Upcoming Major Projects (&gt;$50k / Critical)</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="py-2">🏢 Property</th>
              <th className="py-2">🔧 Project</th>
              <th className="py-2">💰 Budget</th>
              <th className="py-2">📅 Planned</th>
              <th className="py-2">Status</th>
              <th className="py-2">Priority</th>
            </tr>
          </thead>
          <tbody>
            {filtered
              .filter((project) => project.budget > 50000 || project.priority.toLowerCase() === 'critical')
              .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime())
              .map((project) => {
                const health = getCapexPriorityHealth(project.priority)
                return (
                  <tr key={project.id} className="border-b border-slate-800 text-slate-200">
                    <td className="py-2">{project.propertyName}</td>
                    <td className="py-2">{project.project}</td>
                    <td className="py-2">{formatCurrency(project.budget)}</td>
                    <td className="py-2">{formatDate(project.plannedDate)}</td>
                    <td className="py-2">{project.status}</td>
                    <td className="py-2"><HealthBadge tone={health.tone} label={health.label} emoji={health.emoji} /></td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </section>
    </div>
  )
}
