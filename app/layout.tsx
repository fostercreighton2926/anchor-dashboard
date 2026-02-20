import type { Metadata } from 'next'
import Image from 'next/image'
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
            <header className="border-b border-slate-200 bg-slate-50/90 px-4 py-4 backdrop-blur md:hidden">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                <Image
                  src="/anchor-icon.jpg"
                  alt="Anchor Investments"
                  width={96}
                  height={96}
                  className="h-20 w-20 object-contain"
                  priority
                />
              </div>
              <p className="mt-1 text-base font-semibold text-slate-900">Portfolio Command Center</p>
            </header>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
