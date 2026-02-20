import { HealthTone } from '@/lib/health'

function toneClasses(tone: HealthTone): string {
  if (tone === 'green') return 'bg-anchor-primary/15 text-anchor-primaryDark border border-anchor-primary/40'
  if (tone === 'yellow') return 'bg-amber-100 text-amber-800 border border-amber-300'
  if (tone === 'red') return 'bg-red-100 text-red-800 border border-red-300'
  return 'bg-anchor-primary/15 text-anchor-primaryDark border border-anchor-primary/40'
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
