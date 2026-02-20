import Image from 'next/image'
import Link from 'next/link'

const links = [
  { href: '/', label: '📊 2026 Operational Dashboard' },
  { href: '/annual-property-reviews', label: '📘 Annual Property Reviews' },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-72 md:flex-col md:border-r md:border-slate-800 md:bg-slate-950">
      <div className="border-b border-slate-800 px-6 py-8">
        <div className="h-9 w-40 overflow-hidden">
          <Image
            src="/anchor-logo.jpg"
            alt="Anchor Investments"
            width={230}
            height={46}
            className="-ml-1 h-9 w-auto max-w-none"
            priority
          />
        </div>
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
