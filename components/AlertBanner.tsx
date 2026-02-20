'use client'

import { useState } from 'react'
import { HealthTone } from '@/lib/health'

function toneClasses(tone: HealthTone): string {
  if (tone === 'red') return 'border-red-300 bg-red-50 text-red-900'
  if (tone === 'yellow') return 'border-amber-300 bg-amber-50 text-amber-900'
  return 'border-anchor-primary/50 bg-anchor-primary/10 text-anchor-text'
}

export default function AlertBanner({
  title,
  items,
  tone,
  icon,
}: {
  title: string
  items: string[]
  tone: HealthTone
  icon: string
}) {
  const [visible, setVisible] = useState(true)

  if (!visible || items.length === 0) return null

  return (
    <div className={`rounded-xl border p-4 ${toneClasses(tone)}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{icon} {title}</p>
          <p className="mt-2 text-sm opacity-90">{items.slice(0, 4).join(' • ')}</p>
        </div>
        <button
          type="button"
          className="rounded-md border border-anchor-border px-2 py-1 text-xs"
          onClick={() => setVisible(false)}
          aria-label="Dismiss alert"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
