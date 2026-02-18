import { supabaseAdmin } from '@/lib/supabase-server'
import { Property, parseOccupancy } from '@/lib/types'
import PropertyCard from '@/components/PropertyCard'

export const revalidate = 3600 // revalidate every hour

async function getProperties(): Promise<Property[]> {
  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('*')
    .order('property_name')

  if (error) {
    console.error('Error fetching properties:', error)
    return []
  }
  return data || []
}

export default async function PortfolioPage() {
  const properties = await getProperties()

  const avgOccupancy = properties.length
    ? Math.round(
        properties.reduce((sum, p) => sum + parseOccupancy(p.occupancy_rate), 0) / properties.length
      )
    : 0

  const fullOccupancy = properties.filter(p => parseOccupancy(p.occupancy_rate) >= 100).length
  const lowOccupancy = properties.filter(p => parseOccupancy(p.occupancy_rate) < 80 && parseOccupancy(p.occupancy_rate) > 0).length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Property Portfolio</h1>
        <p className="text-gray-500 mt-1">{properties.length} properties under management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{properties.length}</div>
          <div className="text-sm text-gray-500 mt-1">Total Properties</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{avgOccupancy}%</div>
          <div className="text-sm text-gray-500 mt-1">Avg Occupancy</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{fullOccupancy}</div>
          <div className="text-sm text-gray-500 mt-1">At 100% Occupancy</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-500">{lowOccupancy}</div>
          <div className="text-sm text-gray-500 mt-1">Below 80% Occupancy</div>
        </div>
      </div>

      {/* Property Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-4">🏢</div>
          <div className="text-lg font-medium">No properties yet</div>
          <div className="text-sm mt-2">Run the seed script to load your portfolio data.</div>
          <code className="block mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm inline-block">
            npm run seed
          </code>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}
