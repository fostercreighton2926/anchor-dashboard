import { getOccupancyHealth } from '@/lib/health'

function gaugeColor(value: number): string {
  if (value < 85) return '#ef4444'
  if (value < 95) return '#b45309'
  return '#7A9A8A'
}

export default function GaugeChart({
  value,
  label,
  size = 92,
}: {
  value: number | null
  label: string
  size?: number
}) {
  const normalized = value === null || !Number.isFinite(value) ? 0 : Math.max(0, Math.min(100, value))
  const radius = size / 2 - 8
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (normalized / 100) * circumference
  const health = getOccupancyHealth(value)

  return (
    <div className="inline-flex flex-col items-center">
      <svg width={size} height={size} role="img" aria-label={`${label} ${normalized.toFixed(0)} percent`}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#D9DED9" strokeWidth="8" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gaugeColor(normalized)}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#000000" fontSize="16" fontWeight="700">
          {value === null ? 'N/A' : `${normalized.toFixed(0)}%`}
        </text>
      </svg>
      <p className="mt-1 text-xs text-anchor-muted">{label}</p>
      <p className="text-xs text-anchor-body">{health.emoji} {health.label}</p>
    </div>
  )
}
