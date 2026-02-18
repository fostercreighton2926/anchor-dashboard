import Link from 'next/link'
import { Property, slugify, occupancyBadgeColor, nextCapex, firstRenewal } from '@/lib/types'

export default function PropertyCard({ property }: { property: Property }) {
  const slug = slugify(property.property_name)
  const capex = nextCapex(property.capex_budget)
  const renewal = firstRenewal(property.renewals)

  return (
    <Link href={`/properties/${slug}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">{property.property_name}</h3>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ml-2 whitespace-nowrap ${occupancyBadgeColor(property.occupancy_rate)}`}>
            {property.occupancy_rate || 'N/A'}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          {renewal && (
            <div className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">🔄</span>
              <div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Next Renewal</div>
                <div className="text-gray-700 truncate">{renewal}</div>
              </div>
            </div>
          )}
          {capex && (
            <div className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">🔧</span>
              <div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Next CapEx ({capex.year})</div>
                <div className="text-gray-700">{capex.amount}</div>
              </div>
            </div>
          )}
          {!renewal && !capex && (
            <div className="text-gray-400 text-xs italic">No upcoming renewals or CapEx</div>
          )}
        </div>
      </div>
    </Link>
  )
}
