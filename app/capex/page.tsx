import CapexDashboardClient from '@/components/dashboard/CapexDashboardClient'
import { getCapexProjects } from '@/lib/capex'

export const dynamic = 'force-dynamic'

export default async function CapexPage() {
  const projects = getCapexProjects()
  return <CapexDashboardClient projects={projects} />
}
