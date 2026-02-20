import { HealthTone } from '@/lib/health'

function toneClasses(tone: HealthTone): string {
  if (tone === 'green') return 'border border-emerald-200 bg-emerald-50 text-emerald-700'
  if (tone === 'yellow') return 'border border-amber-200 bg-amber-50 text-amber-700'
  if (tone === 'red') return 'border border-red-200 bg-red-50 text-red-700'
  return 'border border-[#7A9A8A]/35 bg-[#7A9A8A]/10 text-[#456255]'
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
