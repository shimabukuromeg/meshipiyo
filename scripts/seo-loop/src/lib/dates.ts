export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function parseDate(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`invalid date: ${value}`)
  }
  return date
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

export function daysBetween(a: string, b: string): number {
  const ms = parseDate(b).getTime() - parseDate(a).getTime()
  return Math.floor(ms / (24 * 60 * 60 * 1000))
}

/** 直近3日は未確定のため除外したうえで、直近28日と前28日の窓を返す */
export function analyticsWindows(today = new Date()) {
  const endRecent = addDays(today, -3)
  const startRecent = addDays(endRecent, -27)
  const endPrevious = addDays(startRecent, -1)
  const startPrevious = addDays(endPrevious, -27)
  return {
    recent: {
      startDate: toDateString(startRecent),
      endDate: toDateString(endRecent),
    },
    previous: {
      startDate: toDateString(startPrevious),
      endDate: toDateString(endPrevious),
    },
  }
}

export function experimentWindows(startDate: string) {
  const start = parseDate(startDate)
  const beforeEnd = addDays(start, -1)
  const beforeStart = addDays(beforeEnd, -13)
  const afterStart = start
  const afterEnd = addDays(start, 13)
  return {
    before: {
      startDate: toDateString(beforeStart),
      endDate: toDateString(beforeEnd),
    },
    after: {
      startDate: toDateString(afterStart),
      endDate: toDateString(afterEnd),
    },
  }
}
