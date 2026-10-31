export const CLINIC_TIME_ZONE = import.meta.env.VITE_CLINIC_TIME_ZONE || 'Asia/Shanghai'

function toDate(value?: string | null): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDateOnly(value?: string | null): string {
  if (!value) return ''
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value)
  if (match) return match[1]

  const date = toDate(value)
  if (!date) return ''
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

export function formatDateTime(value?: string | null): string {
  const date = toDate(value)
  if (!date) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: CLINIC_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
}

export function formatTime(value?: string | null): string {
  const date = toDate(value)
  if (!date) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: CLINIC_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
}

export function formatMonthDay(value?: string | null): string {
  const date = toDate(value)
  if (!date) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: CLINIC_TIME_ZONE,
    month: 'long',
    day: 'numeric'
  }).format(date)
}

export function formatWeekday(value?: string | null): string {
  const date = toDate(value)
  if (!date) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: CLINIC_TIME_ZONE,
    weekday: 'short'
  }).format(date)
}
