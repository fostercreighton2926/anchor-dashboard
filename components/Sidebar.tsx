import Link from 'next/link'

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-72 md:flex-col md:border-r md:border-slate-800 md:bg-slate-950">
      <div className="border-b border-slate-800 px-6 py-8">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Anchor Investments</p>
        <h1 className="mt-3 text-xl font-semibold text-white">Property Portfolio</h1>
      </div>

      <nav className="flex-1 px-4 py-6">
        <Link
          href="/"
          className="block rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
        >
          Portfolio Overview
        </Link>
        <Link
          href="/debt"
          className="mt-3 block rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
        >
          Debt Overview
        </Link>
        <Link
          href="/financial-metrics"
          className="mt-3 block rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
        >
          Financial Metrics
        </Link>
      </nav>

      <div className="border-t border-slate-800 px-6 py-4 text-xs text-slate-500">
        Anchor Investments
      </div>
    </aside>
  )
}
