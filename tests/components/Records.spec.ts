import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import Records from '@/views/Records.vue'
import { endpoints } from '@/api/endpoints'

const route = { query: { filter: 'all' } }
vi.mock('vue-router', () => ({ useRoute: () => route, useRouter: () => ({ replace: vi.fn() }), onBeforeRouteLeave: vi.fn() }))
vi.mock('@/api/endpoints', () => ({ endpoints: { listTickets: vi.fn() } }))

describe('appointment records', () => {
  it('filters the loaded records and can load the next page', async () => {
    setActivePinia(createPinia())
    route.query.filter = 'finished'
    vi.mocked(endpoints.listTickets).mockResolvedValueOnce({ items: [
      { url: '/api/tickets/2', status: 'pending' } as never,
      { url: '/api/tickets/1', status: 'completed' } as never
    ], total: 3, page: 1, pageSize: 2 }).mockResolvedValueOnce({ items: [
      { url: '/api/tickets/3', status: 'rejected' } as never
    ], total: 3, page: 2, pageSize: 2 })
    const wrapper = mount(Records, { global: { stubs: {
      RecordPreview: { props: ['record'], template: '<p class="record">{{ record.url }}</p>' },
      VuxPopup: true
    } } })
    await flushPromises()
    expect(wrapper.findAll('.record').map((item) => item.text())).toEqual(['/api/tickets/1'])
    await wrapper.findAll('button').find((button) => button.text() === '加载更多')!.trigger('click')
    await flushPromises()
    expect(wrapper.findAll('.record').map((item) => item.text())).toEqual(['/api/tickets/1', '/api/tickets/3'])
  })

  it('discards an old page response after an edit refresh', async () => {
    setActivePinia(createPinia())
    route.query.filter = 'all'
    let resolveOld!: (page: never) => void
    vi.mocked(endpoints.listTickets).mockReset()
    vi.mocked(endpoints.listTickets)
      .mockResolvedValueOnce({ items: [{ url: '/api/tickets/1', status: 'pending' } as never], total: 2, page: 1, pageSize: 1 })
      .mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve }))
      .mockResolvedValueOnce({ items: [{ url: '/api/tickets/1', status: 'confirmed' } as never], total: 1, page: 1, pageSize: 1 })
    const tickets = (await import('@/stores/tickets')).useTicketsStore()
    vi.spyOn(tickets, 'refreshWorking').mockResolvedValue(true)
    const wrapper = mount(Records, { global: { stubs: {
      RecordPreview: { props: ['record'], template: '<button class="record" @click="$emit(\'edit\')">{{ record.status }}</button>' },
      VuxPopup: { template: '<div><slot /></div>' },
      PopupContent: { template: '<button class="updated" @click="$emit(\'updated\')">更新</button>' }
    } } })
    await flushPromises()
    await wrapper.findAll('button').find((item) => item.text() === '加载更多')!.trigger('click')
    await wrapper.find('.record').trigger('click')
    await wrapper.find('.updated').trigger('click')
    await flushPromises()
    resolveOld({ items: [{ url: '/api/tickets/2', status: 'completed' }], total: 2, page: 2, pageSize: 1 } as never)
    await flushPromises()
    expect(wrapper.findAll('.record').map((item) => item.text())).toEqual(['confirmed'])
  })
})
