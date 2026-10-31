import type { Room, ServiceDate } from '@/api/types'

import { formatDateOnly, formatMonthDay, formatTime, formatWeekday } from './format'

export interface ServiceDateWithRoom extends ServiceDate {
  dateOnly: string
  startLabel: string
  endLabel: string
  room?: Room
  remaining: number
}

export interface DateOption {
  date: string
  label: string
  weekday: string
}

export interface ServiceDateOption extends DateOption {
  startLabel: string
  endLabel: string
}

export function joinServiceDates(dates: ServiceDate[], rooms: Room[]): ServiceDateWithRoom[] {
  const roomsById = new Map(rooms.map((room) => [room.id, room]))

  return dates
    .map((date) => ({
      ...date,
      dateOnly: formatDateOnly(date.date),
      startLabel: formatTime(date.startTime),
      endLabel: formatTime(date.endTime),
      room: date.room_id == null ? undefined : roomsById.get(date.room_id),
      remaining: Math.max(0, date.capacity - date.count)
    }))
    .filter((date) => Boolean(date.dateOnly))
    .sort((a, b) => {
      const byDate = a.dateOnly.localeCompare(b.dateOnly)
      if (byDate !== 0) return byDate
      return a.startLabel.localeCompare(b.startLabel)
    })
}

export function getRoomAddress(rooms: Room[], campusName?: string | null): string {
  if (!campusName) return ''
  return rooms.find((room) => room.name === campusName)?.address ?? ''
}

export function getRoomByName(rooms: Room[], campusName?: string | null): Room | undefined {
  if (!campusName) return undefined
  return rooms.find((room) => room.name === campusName)
}

export function availableDatesForCampus(
  dates: ServiceDateWithRoom[],
  campusName: string
): ServiceDateWithRoom[] {
  return dates.filter((date) => date.room?.name === campusName && date.remaining > 0)
}

export function buildDateOptions(dates: ServiceDateWithRoom[]): DateOption[] {
  const seen = new Set<string>()
  const options: DateOption[] = []

  for (const date of dates) {
    if (!date.dateOnly || seen.has(date.dateOnly)) continue
    seen.add(date.dateOnly)
    options.push({
      date: date.dateOnly,
      label: formatMonthDay(date.date),
      weekday: formatWeekday(date.date)
    })
  }

  return options.sort((a, b) => a.date.localeCompare(b.date))
}

export function findServiceDate(
  dates: ServiceDateWithRoom[],
  campusName: string,
  dateOnly: string
): ServiceDateWithRoom | undefined {
  return dates.find((date) => date.room?.name === campusName && date.dateOnly === dateOnly)
}
