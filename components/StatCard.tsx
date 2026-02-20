import { HealthTone } from '@/lib/health'

function toneBorder(tone: HealthTone): string {
  if (tone === 'green') return 'border-emerald-500/60'
  if (tone === 'yellow') return 'border-amber-500/60'
  if (tone === 'red') return 'border-red-500/60'
  return 'border-blue-500/60'
}

function toneText(tone: HealthTone): string {
  if (tone === 'green') return 'text-emerald-300'
  if (tone === 'yellow') return 'text-amber-300'
  if (tone === 'red') return 'text-red-300'
  return 'text-blue-300'
}

export default function StatCard({
  emoji,
  label,
  value,
  trend,
  trendLabel,
  tone,
}: {
  emoji: string
  label: string
  value: string
  trend?: 'up' | 'down' | 'flat'
  trendLabel?: string
  tone: HealthTone
}) {
  const trendSymbol = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '⏸️'

  return (
    <div className={`rounded-2xl border bg-slate-900/80 p-4 shadow-sm ${toneBorder(tone)}`}>
      <p className="text-xs uppercase tracking-wide text-slate-400">{emoji} {label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-100">{value}</p>
      {trendLabel ? (
        <p className={`mt-2 text-xs font-medium ${toneText(tone)}`}>
          {trendSymbol} {trendLabel}
        </p>
      ) : null}
    </div>
  )
}
