import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import { endpoints } from '@/api/endpoints'
import { useCatalogStore } from '@/stores/catalog'

vi.mock('@/api/endpoints', () => ({ endpoints: {
  listCampuses: vi.fn(), listRooms: vi.fn(), listServiceDates: vi.fn(), listAnnouncements: vi.fn()
} }))

const page = (items: unknown[]) => ({ items, total: items.length, page: 1, pageSize: 100 })

describe('catalog loading', () => {
  it('keeps locations available when announcements fail and blocks full refresh', async () => {
    setActivePinia(createPinia())
    vi.mocked(endpoints.listCampuses).mockResolvedValue(page([{ id: 1, name: '校区' }]) as never)
    vi.mocked(endpoints.listRooms).mockResolvedValue(page([{ id: 2, name: '诊室', campus_id: 1, enabled: true }]) as never)
    vi.mocked(endpoints.listServiceDates).mockResolvedValue(page([]) as never)
    vi.mocked(endpoints.listAnnouncements).mockRejectedValue(new Error('offline'))
    const store = useCatalogStore()
    expect(await store.reload()).toBe(false)
    expect(store.rooms[0].name).toBe('诊室')
    expect(store.campuses[0].name).toBe('校区')
    expect(store.error).toBe('')
    expect(await store.ensure()).toBe(true)
  })
})
