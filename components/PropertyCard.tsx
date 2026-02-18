import Link from 'next/link'
import { Property, firstUpcomingRenewal, nextCapex, occupancyBadge, slugify } from '@/lib/types'

export default function PropertyCard({ property }: { property: Property }) {
  const renewal = firstUpcomingRenewal(property.renewals)
  const capex = nextCapex(property.capex_budget)

  return (
    <Link
      href={`/properties/${slugify(property.property_name)}`}
      className="group rounded-xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-slate-600 hover:bg-slate-900"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-100">{property.property_name}</h3>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${occupancyBadge(property.occupancy_rate)}`}
        >
          {property.occupancy_rate ?? 'N/A'}
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">First Upcoming Renewal</p>
          <p className="mt-1 text-slate-200">{renewal ?? 'Not provided'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Next CapEx</p>
          <p className="mt-1 text-slate-200">
            {capex ? `${capex.year}: ${capex.amount}` : 'Not provided'}
          </p>
        </div>
      </div>
    </Link>
  )
}
