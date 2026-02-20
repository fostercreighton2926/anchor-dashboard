'use client'

import { useState } from 'react'
import { HealthTone } from '@/lib/health'

function toneClasses(tone: HealthTone): string {
  if (tone === 'red') return 'border-red-500/50 bg-red-500/10 text-red-100'
  if (tone === 'yellow') return 'border-amber-500/50 bg-amber-500/10 text-amber-100'
  return 'border-blue-500/50 bg-blue-500/10 text-blue-100'
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
          className="rounded-md border border-slate-500/40 px-2 py-1 text-xs"
          onClick={() => setVisible(false)}
          aria-label="Dismiss alert"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
