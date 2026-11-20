import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import Records from '@/views/Records.vue'
import { endpoints } from '@/api/endpoints'

const route = { query: { filter: 'all' } }
vi.mock('vue-router', () => ({ useRoute: () => route, useRouter: () => ({ replace: vi.fn() }) }))
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
})
