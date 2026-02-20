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
      <body className="font-sans bg-anchor-cream text-anchor-body">
        <div className="min-h-screen md:flex">
          <Sidebar />
          <main className="flex-1">
            <header className="border-b border-anchor-border bg-white px-4 py-4 md:hidden">
              <Image
                src="/anchor-logo.jpg"
                alt="Anchor Investments"
                width={220}
                height={44}
                className="h-auto w-auto max-w-[220px]"
                priority
              />
              <p className="mt-2 text-sm font-heading text-anchor-text">Portfolio Command Center</p>
            </header>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
