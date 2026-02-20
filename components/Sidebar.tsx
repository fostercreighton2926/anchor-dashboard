import Image from 'next/image'
import Link from 'next/link'

const links = [
  { href: '/', label: '📊 2026 Operational Dashboard' },
  { href: '/annual-property-reviews', label: '📘 Annual Property Reviews' },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-72 md:flex-col md:border-r md:border-anchor-border md:bg-white">
      <div className="border-b border-anchor-border px-6 py-6">
        <Image
          src="/anchor-logo.jpg"
          alt="Anchor Investments"
          width={220}
          height={44}
          className="h-auto w-auto max-w-[220px]"
          priority
        />
        <h1 className="mt-4 text-lg font-semibold text-anchor-text font-heading">Portfolio Command Center</h1>
      </div>

      <nav className="flex-1 px-4 py-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="mt-3 block rounded-lg border border-anchor-border bg-white px-4 py-3 text-sm font-medium text-anchor-body transition hover:border-anchor-primary hover:bg-anchor-primary/10"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-anchor-border px-6 py-4 text-xs text-anchor-muted">
        Anchor Investments
      </div>
    </aside>
  )
}
