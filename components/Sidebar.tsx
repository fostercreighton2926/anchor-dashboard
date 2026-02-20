'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: '📊 2026 Operational Dashboard' },
  { href: '/annual-property-reviews', label: '📘 Annual Property Reviews' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-72 md:flex-col md:border-r md:border-slate-200 md:bg-slate-50/95">
      <div className="border-b border-slate-200 px-6 py-8">
        <div className="mb-3 flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <Image src="/anchor-icon.jpg" alt="Anchor icon" width={28} height={28} className="h-7 w-7 object-contain" priority />
        </div>
        <h1 className="text-xl font-semibold text-slate-900">Portfolio Command Center</h1>
      </div>

      <nav className="flex-1 px-4 py-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`mt-3 block rounded-lg border px-4 py-3 text-sm font-medium transition ${
              pathname === link.href
                ? 'border-[#7A9A8A]/45 bg-[#7A9A8A]/14 text-[#456255] shadow-sm'
                : 'border-slate-200 bg-white text-slate-700 hover:border-[#7A9A8A]/45 hover:bg-[#7A9A8A]/8'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-6 py-4 text-xs text-slate-500">
        Anchor Investments
      </div>
    </aside>
  )
}
