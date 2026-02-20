'use client'

import Link from 'next/link'

const palette = ['#7A9A8A', '#5E7B6D', '#A3B7AB', '#B45309', '#DC2626', '#9CA3AF', '#6B7280', '#4B5563']

export function BarChartCard({
  title,
  data,
  onSortToggle,
  sortLabel,
}: {
  title: string
  data: Array<{ label: string; value: number; color?: string; href?: string }>
  onSortToggle?: () => void
  sortLabel?: string
}) {
  const max = Math.max(1, ...data.map((item) => item.value))

  return (
    <div className="rounded-2xl border border-anchor-border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-anchor-text font-heading">{title}</h3>
        {onSortToggle ? (
          <button onClick={onSortToggle} className="rounded-lg border border-anchor-border px-2 py-1 text-xs text-anchor-body hover:border-anchor-primary">
            Sort: {sortLabel}
          </button>
        ) : null}
      </div>
      <div className="space-y-2">
        {data.map((item) => {
          const width = `${Math.max(3, (item.value / max) * 100)}%`
          const row = (
            <div key={item.label} className="group">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="truncate text-anchor-body">{item.label}</span>
                <span className="text-anchor-muted">{item.value.toLocaleString()}</span>
              </div>
              <div className="h-3 rounded-full bg-anchor-border/60">
                <div className="h-full rounded-full transition-all" style={{ width, backgroundColor: item.color ?? '#7A9A8A' }} />
              </div>
            </div>
          )

          if (!item.href) return row
          return (
            <Link key={item.label} href={item.href} className="block">
              {row}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function PieChartCard({
  title,
  data,
  donut = false,
}: {
  title: string
  data: Array<{ label: string; value: number; color?: string }>
  donut?: boolean
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1
  let cumulative = 0
  const radius = 58
  const inner = donut ? 34 : 0
  const center = 70

  const arcs = data.map((item, index) => {
    const fraction = item.value / total
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2
    cumulative += fraction
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2

    const x1 = center + radius * Math.cos(startAngle)
    const y1 = center + radius * Math.sin(startAngle)
    const x2 = center + radius * Math.cos(endAngle)
    const y2 = center + radius * Math.sin(endAngle)
    const largeArc = fraction > 0.5 ? 1 : 0

    const path = donut
      ? `M ${center + inner * Math.cos(startAngle)} ${center + inner * Math.sin(startAngle)} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${center + inner * Math.cos(endAngle)} ${center + inner * Math.sin(endAngle)} A ${inner} ${inner} 0 ${largeArc} 0 ${center + inner * Math.cos(startAngle)} ${center + inner * Math.sin(startAngle)} Z`
      : `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

    return { ...item, path, color: item.color ?? palette[index % palette.length] }
  })

  return (
    <div className="rounded-2xl border border-anchor-border bg-white p-4">
      <h3 className="text-sm font-semibold text-anchor-text font-heading">{title}</h3>
      <div className="mt-3 flex items-center gap-4">
        <svg width="140" height="140" viewBox="0 0 140 140" aria-label={title}>
          {arcs.map((arc) => (
            <path key={arc.label} d={arc.path} fill={arc.color} />
          ))}
          {donut ? <text x="70" y="74" textAnchor="middle" fill="#000000" fontSize="11">{Math.round(total)}</text> : null}
        </svg>
        <div className="space-y-2 text-xs">
          {data.map((item, index) => (
            <div key={item.label} className="flex items-center gap-2 text-anchor-body">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color ?? palette[index % palette.length] }} />
              <span>{item.label}</span>
              <span className="text-anchor-muted">{((item.value / total) * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LineChartCard({
  title,
  data,
}: {
  title: string
  data: Array<{ label: string; value: number }>
}) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const min = Math.min(...data.map((d) => d.value))
  const range = Math.max(1, max - min)

  const points = data
    .map((item, index) => {
      const x = (index / Math.max(1, data.length - 1)) * 100
      const y = 100 - ((item.value - min) / range) * 100
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="rounded-2xl border border-anchor-border bg-white p-4">
      <h3 className="text-sm font-semibold text-anchor-text font-heading">{title}</h3>
      <svg className="mt-4 h-40 w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label={title}>
        <polyline fill="none" stroke="#7A9A8A" strokeWidth="2" points={points} />
      </svg>
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-anchor-muted">
        {data.map((item) => (
          <span key={item.label}>{item.label}: {item.value.toFixed(1)}%</span>
        ))}
      </div>
    </div>
  )
}

export function ScatterChartCard({
  title,
  data,
}: {
  title: string
  data: Array<{ x: number; y: number; label: string; color: string }>
}) {
  const maxX = Math.max(1, ...data.map((d) => d.x))
  const maxY = Math.max(1, ...data.map((d) => d.y))

  return (
    <div className="rounded-2xl border border-anchor-border bg-white p-4">
      <h3 className="text-sm font-semibold text-anchor-text font-heading">{title}</h3>
      <svg className="mt-4 h-56 w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label={title}>
        <line x1="0" y1="100" x2="100" y2="0" stroke="#9CA3AF" strokeDasharray="2 2" />
        {data.map((item) => {
          const cx = (item.x / maxX) * 96 + 2
          const cy = 98 - (item.y / maxY) * 96
          return <circle key={item.label} cx={cx} cy={cy} r="2.3" fill={item.color}>
            <title>{item.label}</title>
          </circle>
        })}
      </svg>
      <p className="mt-2 text-xs text-anchor-muted">Diagonal line indicates DSCR break-even trend.</p>
    </div>
  )
}

export function TimelineChart({
  title,
  rows,
}: {
  title: string
  rows: Array<{ label: string; startMonth: number; endMonth: number; color: string; valueLabel: string }>
}) {
  return (
    <div className="rounded-2xl border border-anchor-border bg-white p-4">
      <h3 className="text-sm font-semibold text-anchor-text font-heading">{title}</h3>
      <div className="mt-4 space-y-3">
        {rows.map((row) => {
          const left = `${Math.max(0, Math.min(100, (row.startMonth / 120) * 100))}%`
          const width = `${Math.max(2, ((row.endMonth - row.startMonth) / 120) * 100)}%`
          return (
            <div key={`${row.label}-${row.startMonth}`}>
              <div className="mb-1 flex justify-between text-xs text-anchor-muted">
                <span>{row.label}</span>
                <span>{row.valueLabel}</span>
              </div>
              <div className="relative h-5 rounded bg-anchor-border/60">
                <div className="absolute inset-y-0 rounded" style={{ left, width, backgroundColor: row.color }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
