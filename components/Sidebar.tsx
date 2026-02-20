import Link from 'next/link'

const links = [
  { href: '/', label: '📊 2026 Operational Dashboard' },
  { href: '/annual-property-reviews', label: '📘 Annual Property Reviews' },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-72 md:flex-col md:border-r md:border-slate-800 md:bg-slate-950">
      <div className="border-b border-slate-800 px-6 py-8">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Anchor Investments</p>
        <h1 className="mt-3 text-xl font-semibold text-white">Portfolio Command Center</h1>
      </div>

      <nav className="flex-1 px-4 py-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="mt-3 block rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-blue-500/60 hover:bg-blue-500/10"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-800 px-6 py-4 text-xs text-slate-500">
        Anchor Investments
      </div>
    </aside>
  )
}
