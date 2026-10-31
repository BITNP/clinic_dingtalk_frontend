import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Page, Ticket, TicketDraft } from '@/api/types'

vi.mock('@/api/endpoints', () => ({
  endpoints: {
    getWorkingTicket: vi.fn(),
    getFinishedTickets: vi.fn(),
    createTicket: vi.fn(),
    updateTicket: vi.fn(),
    deleteTicket: vi.fn()
  }
}))

import { endpoints } from '@/api/endpoints'
import { useTicketsStore } from '@/stores/tickets'
import { useUiStore } from '@/stores/ui'

function ticket(id: number, status: Ticket['status'] = 'completed'): Ticket {
  return {
    url: `/api/tickets/${id}`,
    user: 'student01',
    status,
    realname: '张三',
    phone_num: '13800000000',
    campus: '北区医务室',
    appointment_time: '2026-11-02',
    description: '风扇异响',
    worker_description: '',
    model: 'ThinkPad X1',
    reject_reason: '',
    password: '123456',
    liquid_metal_status: 'unknown'
  }
}

function pageOf(items: Ticket[], total: number, page: number, pageSize = 20): Page<Ticket> {
  return { items, total, page, pageSize }
}

function draft(): TicketDraft {
  return {
    campus: '北区医务室',
    appointment_time: '2026-11-02',
    description: '风扇异响',
    realname: '张三',
    phone_num: '13800000000',
    model: 'ThinkPad X1',
    password: ''
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  vi.mocked(endpoints.getWorkingTicket).mockResolvedValue({ count: 0 })
})

describe('finished ticket pagination', () => {
  it('walks pages, deduplicates records, and stops at the total', async () => {
    vi.mocked(endpoints.getFinishedTickets)
      .mockResolvedValueOnce(pageOf([ticket(2), ticket(1)], 3, 1, 2))
      .mockResolvedValueOnce(pageOf([ticket(1), ticket(0)], 3, 2, 2))

    const store = useTicketsStore()

    expect(await store.loadFinishedPage(1)).toBe(true)
    expect(store.finished.map((item) => item.url)).toEqual([
      '/api/tickets/2',
      '/api/tickets/1'
    ])
    expect(store.hasMoreFinished).toBe(true)

    expect(await store.loadFinishedPage(2)).toBe(true)
    expect(store.finished.map((item) => item.url)).toEqual([
      '/api/tickets/2',
      '/api/tickets/1',
      '/api/tickets/0'
    ])
    expect(store.hasMoreFinished).toBe(false)
  })

  it('exposes an error state instead of spinning forever', async () => {
    vi.mocked(endpoints.getFinishedTickets).mockRejectedValueOnce(new Error('网络错误'))
    const store = useTicketsStore()
    const ui = useUiStore()
    const errorSpy = vi.spyOn(ui, 'error')

    expect(await store.loadFinishedPage(1)).toBe(false)
    expect(store.finishedError).toBe('网络错误')
    expect(errorSpy).toHaveBeenCalledWith('网络错误')
  })
})

describe('ticket mutations', () => {
  it('only replaces the working ticket after a successful update', async () => {
    const store = useTicketsStore()
    const original = ticket(5, 'confirmed')
    store.working = original

    vi.mocked(endpoints.updateTicket).mockRejectedValueOnce(new Error('更新失败'))
    expect(await store.updateTicket(original, draft())).toBe(false)
    expect(store.working).toEqual(original)

    const updated = { ...original, description: '已更换风扇' }
    vi.mocked(endpoints.updateTicket).mockResolvedValueOnce(updated)
    expect(await store.updateTicket(original, draft())).toBe(true)
    expect(store.working).toEqual(updated)
  })

  it('ignores a second create while the first request is in flight', async () => {
    let resolveCreate: ((value: Ticket) => void) | undefined
    vi.mocked(endpoints.createTicket).mockImplementation(
      () =>
        new Promise<Ticket>((resolve) => {
          resolveCreate = resolve
        })
    )

    const store = useTicketsStore()
    const first = store.createTicket(draft())
    const second = store.createTicket(draft())

    expect(endpoints.createTicket).toHaveBeenCalledTimes(1)

    resolveCreate?.(ticket(9, 'pending'))
    expect(await first).toBe(true)
    expect(await second).toBe(false)
  })

  it('refreshes the working ticket after deletion', async () => {
    const store = useTicketsStore()
    store.working = ticket(7, 'confirmed')

    vi.mocked(endpoints.deleteTicket).mockResolvedValueOnce(undefined)
    vi.mocked(endpoints.getWorkingTicket).mockResolvedValueOnce({ count: 0 })

    expect(await store.deleteTicket(store.working as Ticket)).toBe(true)
    expect(store.working).toBeNull()
  })
})
