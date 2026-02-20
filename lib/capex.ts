import capexPlaceholder from '@/data/capex-placeholder.json'

export type CapexStatus = 'Planning' | 'In Progress' | 'Complete'

export interface CapexProject {
  id: string
  propertyName: string
  project: string
  category: string
  budget: number
  actualSpend: number
  plannedDate: string
  dueDate: string
  status: CapexStatus
  priority: string
}

export function getCapexProjects(): CapexProject[] {
  return capexPlaceholder as CapexProject[]
}

export function getUpcomingCapEx(days: number, now = new Date()): CapexProject[] {
  const end = new Date(now)
  end.setDate(now.getDate() + days)

  return getCapexProjects().filter((project) => {
    const due = new Date(project.dueDate)
    if (Number.isNaN(due.getTime())) return false
    return due >= now && due <= end
  })
}

export function capexByCategory(projects: CapexProject[]): Array<{ category: string; budget: number }> {
  const totals = new Map<string, number>()

  for (const project of projects) {
    totals.set(project.category, (totals.get(project.category) ?? 0) + project.budget)
  }

  return Array.from(totals.entries())
    .map(([category, budget]) => ({ category, budget }))
    .sort((a, b) => b.budget - a.budget)
}
