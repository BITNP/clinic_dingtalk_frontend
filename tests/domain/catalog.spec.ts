import { describe, expect, it } from 'vitest'

import type { Room, ServiceDate } from '@/api/types'
import {
  availableDatesForCampus,
  buildDateOptions,
  findServiceDate,
  getRoomAddress,
  joinServiceDates
} from '@/domain/catalog'
import roomsFixture from '../fixtures/api/rooms.json'
import datesFixture from '../fixtures/api/service-dates.json'

const rooms = roomsFixture.items as Room[]
const dates = datesFixture.items as ServiceDate[]

describe('catalog joins', () => {
  const joined = joinServiceDates(dates, rooms)

  it('attaches the room name and address to each service date', () => {
    expect(joined[0].room?.name).toBe('北区医务室')
    expect(joined[0].room?.address).toBe('北区 3 号楼 101')
    expect(joined[0].remaining).toBe(13)
  })

  it('sorts by date and start time', () => {
    expect(joined.map((date) => date.dateOnly)).toEqual(['2026-11-02', '2026-11-03'])
  })

  it('looks up addresses safely', () => {
    expect(getRoomAddress(rooms, '北区医务室')).toBe('北区 3 号楼 101')
    expect(getRoomAddress(rooms, '不存在的校区')).toBe('')
    expect(getRoomAddress(rooms, undefined)).toBe('')
  })

  it('filters bookable dates for a campus', () => {
    expect(availableDatesForCampus(joined, '北区医务室')).toHaveLength(1)
    expect(availableDatesForCampus(joined, '南区学生服务中心')).toHaveLength(0)
  })

  it('builds unique date options for the calendar strip', () => {
    expect(buildDateOptions(joined)).toEqual([
      { date: '2026-11-02', label: '11月2日', weekday: '周一' },
      { date: '2026-11-03', label: '11月3日', weekday: '周二' }
    ])
  })

  it('finds a service date by campus and day', () => {
    expect(findServiceDate(joined, '北区医务室', '2026-11-02')?.title).toBe('周一晚')
    expect(findServiceDate(joined, '北区医务室', '2026-11-04')).toBeUndefined()
  })
})
