import PropertyCard from '@/components/PropertyCard'
import { getSupabaseAdmin } from "@/lib/supabase-server"
import { Property, parseOccupancy } from '@/lib/types'

export const revalidate = 3600

async function getProperties(): Promise<Property[]> {
  const { data, error } = await getSupabaseAdmin().from('properties').select('*').order('property_name')

  if (error) {
    console.error('Error fetching properties:', error.message)
    return []
  }

  return data ?? []
}

export default async function PortfolioPage() {
  const properties = await getProperties()

  const occupancyValues = properties
    .map((property) => parseOccupancy(property.occupancy_rate))
    .filter((value): value is number => value !== null)

  const avgOccupancy = occupancyValues.length
    ? Math.round(occupancyValues.reduce((sum, value) => sum + value, 0) / occupancyValues.length)
    : 0

  const fullOccupancy = properties.filter((property) => parseOccupancy(property.occupancy_rate) === 100).length
  const belowEighty = properties.filter((property) => {
    const occupancy = parseOccupancy(property.occupancy_rate)
    return occupancy !== null && occupancy < 80
  }).length

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">Anchor Investments - Property Portfolio</h1>
        <p className="mt-2 text-sm text-slate-400">Commercial real estate operations dashboard</p>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-4">
          <p className="text-2xl font-semibold text-slate-100">{properties.length}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Total Properties</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-4">
          <p className="text-2xl font-semibold text-slate-100">{avgOccupancy}%</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Average Occupancy</p>
        </div>
        <div className="rounded-xl border border-emerald-700/50 bg-emerald-950/30 p-4">
          <p className="text-2xl font-semibold text-emerald-300">{fullOccupancy}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-emerald-200/80">Count At 100%</p>
        </div>
        <div className="rounded-xl border border-rose-700/50 bg-rose-950/30 p-4">
          <p className="text-2xl font-semibold text-rose-300">{belowEighty}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-rose-200/80">Count Below 80%</p>
        </div>
      </section>

      {properties.length === 0 ? (
        <section className="rounded-xl border border-slate-800 bg-slate-900/75 p-8 text-center">
          <p className="text-lg font-semibold text-slate-200">No properties found in Supabase.</p>
          <p className="mt-2 text-sm text-slate-400">Seed the portfolio data with:</p>
          <code className="mt-4 inline-block rounded bg-slate-950 px-3 py-2 text-sm text-slate-300">npm run seed</code>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </section>
      )}
    </div>
  )
}
