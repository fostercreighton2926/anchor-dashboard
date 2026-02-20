export type HealthTone = 'green' | 'yellow' | 'red' | 'blue'

export interface HealthResult {
  tone: HealthTone
  label: string
  emoji: string
  tailwind: string
  subtleTailwind: string
}

function toneToTailwind(tone: HealthTone): string {
  if (tone === 'green') return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
  if (tone === 'yellow') return 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
  if (tone === 'red') return 'bg-red-500/20 text-red-300 border border-red-500/40'
  return 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
}

function toneToSubtleTailwind(tone: HealthTone): string {
  if (tone === 'green') return 'border-emerald-500/40 bg-emerald-500/10'
  if (tone === 'yellow') return 'border-amber-500/40 bg-amber-500/10'
  if (tone === 'red') return 'border-red-500/40 bg-red-500/10'
  return 'border-blue-500/40 bg-blue-500/10'
}

export function getDscrHealth(value: number | null): HealthResult {
  if (value === null || !Number.isFinite(value)) {
    return {
      tone: 'blue',
      label: 'No DSCR data',
      emoji: '📊',
      tailwind: toneToTailwind('blue'),
      subtleTailwind: toneToSubtleTailwind('blue'),
    }
  }

  if (value < 1.25) {
    return {
      tone: 'red',
      label: 'Concern',
      emoji: '🚨',
      tailwind: toneToTailwind('red'),
      subtleTailwind: toneToSubtleTailwind('red'),
    }
  }

  if (value < 1.5) {
    return {
      tone: 'yellow',
      label: 'Watch',
      emoji: '⚠️',
      tailwind: toneToTailwind('yellow'),
      subtleTailwind: toneToSubtleTailwind('yellow'),
    }
  }

  return {
    tone: 'green',
    label: 'Healthy',
    emoji: '✅',
    tailwind: toneToTailwind('green'),
    subtleTailwind: toneToSubtleTailwind('green'),
  }
}

export function getOccupancyHealth(value: number | null): HealthResult {
  if (value === null || !Number.isFinite(value)) {
    return {
      tone: 'blue',
      label: 'No occupancy data',
      emoji: '👥',
      tailwind: toneToTailwind('blue'),
      subtleTailwind: toneToSubtleTailwind('blue'),
    }
  }

  if (value < 85) {
    return {
      tone: 'red',
      label: 'Concern',
      emoji: '🚨',
      tailwind: toneToTailwind('red'),
      subtleTailwind: toneToSubtleTailwind('red'),
    }
  }

  if (value < 95) {
    return {
      tone: 'yellow',
      label: 'Watch',
      emoji: '⚠️',
      tailwind: toneToTailwind('yellow'),
      subtleTailwind: toneToSubtleTailwind('yellow'),
    }
  }

  return {
    tone: 'green',
    label: 'Healthy',
    emoji: '✅',
    tailwind: toneToTailwind('green'),
    subtleTailwind: toneToSubtleTailwind('green'),
  }
}

export function getCapexPriorityHealth(priority: string): HealthResult {
  const key = priority.toLowerCase()
  if (key === 'critical') {
    return {
      tone: 'red',
      label: 'Critical',
      emoji: '🔴',
      tailwind: toneToTailwind('red'),
      subtleTailwind: toneToSubtleTailwind('red'),
    }
  }
  if (key === 'major') {
    return {
      tone: 'yellow',
      label: 'Major',
      emoji: '🟡',
      tailwind: toneToTailwind('yellow'),
      subtleTailwind: toneToSubtleTailwind('yellow'),
    }
  }
  if (key === 'tenant improvements') {
    return {
      tone: 'blue',
      label: 'Tenant Improvements',
      emoji: '🔵',
      tailwind: toneToTailwind('blue'),
      subtleTailwind: toneToSubtleTailwind('blue'),
    }
  }
  return {
    tone: 'green',
    label: 'Routine',
    emoji: '🟢',
    tailwind: toneToTailwind('green'),
    subtleTailwind: toneToSubtleTailwind('green'),
  }
}
