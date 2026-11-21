import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { endpoints } from '@/api/endpoints'
import { createPoller } from '@/sync/poller'

vi.mock('@/api/endpoints', () => ({ endpoints: { getSync: vi.fn(), getSyncConfig: vi.fn() } }))
const counters = (overrides: Record<string, number> = {}) => ({ announcement: 0, record: 0, room: 0, service_date: 0, ...overrides })
let hidden = false
beforeEach(() => {
  vi.useFakeTimers()
  hidden = false
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
  vi.mocked(endpoints.getSync).mockResolvedValue(counters())
  vi.mocked(endpoints.getSyncConfig).mockResolvedValue({ interval_ms: 1000 })
})
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })

function setup() {
  const swaps = { announcement: vi.fn().mockResolvedValue(undefined), location: vi.fn().mockResolvedValue(undefined), record: vi.fn().mockResolvedValue(undefined) }
  return { swaps, poller: createPoller(swaps) }
}

describe('sync poller', () => {
  it('uses configured interval and maps record changes to records and availability', async () => {
    const { swaps, poller } = setup()
    await poller.start()
    expect(swaps.location).toHaveBeenCalledTimes(1)
    vi.mocked(endpoints.getSync).mockResolvedValue(counters({ record: 1 }))
    await vi.advanceTimersByTimeAsync(999)
    expect(swaps.record).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(swaps.record).toHaveBeenCalledTimes(2)
    expect(swaps.location).toHaveBeenCalledTimes(2)
    expect(swaps.announcement).toHaveBeenCalledTimes(1)
    poller.stop()
  })

  it('retries failed swaps, catches up on visibility, and stops polling', async () => {
    const { swaps, poller } = setup()
    swaps.announcement.mockRejectedValueOnce(new Error('offline'))
    await poller.start()
    await vi.advanceTimersByTimeAsync(1000)
    expect(swaps.announcement).toHaveBeenCalledTimes(2)
    hidden = true
    vi.mocked(endpoints.getSync).mockResolvedValue(counters({ room: 1, announcement: 1 }))
    await vi.advanceTimersByTimeAsync(1000)
    expect(swaps.location).toHaveBeenCalledTimes(1)
    hidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(0)
    expect(swaps.location).toHaveBeenCalledTimes(2)
    expect(swaps.announcement).toHaveBeenCalledTimes(3)
    poller.stop()
    const count = vi.mocked(endpoints.getSync).mock.calls.length
    await vi.advanceTimersByTimeAsync(10000)
    expect(endpoints.getSync).toHaveBeenCalledTimes(count)
  })

  it('honors zero interval and applies later configuration changes', async () => {
    vi.mocked(endpoints.getSyncConfig).mockResolvedValueOnce({ interval_ms: 0 }).mockResolvedValue({ interval_ms: 500 })
    const { poller } = setup()
    await poller.start()
    await vi.advanceTimersByTimeAsync(59000)
    expect(endpoints.getSync).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1500)
    expect(endpoints.getSync).toHaveBeenCalledTimes(2)
    poller.stop()
  })

  it('invalidates an in-flight snapshot on stop', async () => {
    let finish!: () => void
    let committed = false
    const swaps = {
      announcement: vi.fn(async (isCurrent: () => boolean) => {
        await new Promise<void>((resolve) => { finish = resolve })
        if (isCurrent()) committed = true
      }),
      location: vi.fn().mockResolvedValue(undefined),
      record: vi.fn().mockResolvedValue(undefined)
    }
    const poller = createPoller(swaps)
    const started = poller.start()
    await vi.advanceTimersByTimeAsync(0)
    poller.stop()
    finish()
    await started
    expect(committed).toBe(false)
  })
})
