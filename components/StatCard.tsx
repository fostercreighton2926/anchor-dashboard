import { HealthTone } from '@/lib/health'

function toneBorder(tone: HealthTone): string {
  if (tone === 'green') return 'border-emerald-200'
  if (tone === 'yellow') return 'border-amber-200'
  if (tone === 'red') return 'border-red-200'
  return 'border-[#7A9A8A]/35'
}

function toneText(tone: HealthTone): string {
  if (tone === 'green') return 'text-emerald-700'
  if (tone === 'yellow') return 'text-amber-700'
  if (tone === 'red') return 'text-red-700'
  return 'text-[#456255]'
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
    <div className={`rounded-2xl border bg-white p-4 shadow-sm ${toneBorder(tone)}`}>
      <p className="text-xs uppercase tracking-wide text-slate-500">{emoji} {label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {trendLabel ? (
        <p className={`mt-2 text-xs font-medium ${toneText(tone)}`}>
          {trendSymbol} {trendLabel}
        </p>
      ) : null}
    </div>
  )
}
