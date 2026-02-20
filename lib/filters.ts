export type SortDirection = 'asc' | 'desc'

export function toggleSortDirection(current: SortDirection): SortDirection {
  return current === 'asc' ? 'desc' : 'asc'
}

export function sortByNumber<T>(rows: T[], selector: (row: T) => number, direction: SortDirection): T[] {
  return [...rows].sort((a, b) => {
    const delta = selector(a) - selector(b)
    return direction === 'asc' ? delta : -delta
  })
}

export function sortByString<T>(rows: T[], selector: (row: T) => string, direction: SortDirection): T[] {
  return [...rows].sort((a, b) => {
    const delta = selector(a).localeCompare(selector(b))
    return direction === 'asc' ? delta : -delta
  })
}

export function withinRange(value: number | null, min: number | null, max: number | null): boolean {
  if (value === null || !Number.isFinite(value)) return false
  if (min !== null && value < min) return false
  if (max !== null && value > max) return false
  return true
}
