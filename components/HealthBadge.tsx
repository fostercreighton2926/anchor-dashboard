import { HealthTone } from '@/lib/health'

function toneClasses(tone: HealthTone): string {
  if (tone === 'green') return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
  if (tone === 'yellow') return 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
  if (tone === 'red') return 'bg-red-500/20 text-red-300 border border-red-500/40'
  return 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
}

export default function HealthBadge({
  label,
  emoji,
  tone,
  className = '',
}: {
  label: string
  emoji?: string
  tone: HealthTone
  className?: string
}) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses(tone)} ${className}`}>
      {emoji ? <span aria-hidden>{emoji}</span> : null}
      <span>{label}</span>
    </span>
  )
}
