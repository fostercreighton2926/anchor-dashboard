import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Anchor Investments - Visual Portfolio Dashboard',
  description: 'Interactive portfolio management dashboard for debt, CapEx, occupancy, and NOI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="min-h-screen md:flex">
          <Sidebar />
          <main className="flex-1">
            <header className="border-b border-slate-800 bg-slate-950/80 px-4 py-4 backdrop-blur md:hidden">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Anchor Investments</p>
              <p className="mt-1 text-base font-semibold text-white">Portfolio Command Center</p>
            </header>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
