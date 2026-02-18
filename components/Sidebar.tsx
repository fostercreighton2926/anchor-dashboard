import Link from 'next/link'

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Anchor Investments</div>
        <div className="text-white font-bold text-lg">Property Dashboard</div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
        >
          <span>🏢</span> Portfolio
        </Link>
      </nav>
      <div className="p-4 border-t border-gray-800 text-xs text-gray-600">
        Anchor Investments © 2025
      </div>
    </aside>
  )
}
