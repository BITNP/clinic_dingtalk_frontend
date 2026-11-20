import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import { endpoints } from '@/api/endpoints'
import Calendar from '@/views/Calendar.vue'
import { useCatalogStore } from '@/stores/catalog'
import { useTicketsStore } from '@/stores/tickets'

const push = vi.fn()
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))
vi.mock('@/api/endpoints', () => ({ endpoints: { recommendRoom: vi.fn(), getRoom: vi.fn() } }))

function setup(count: number) {
  setActivePinia(createPinia())
  push.mockReset()
  const catalog = useCatalogStore()
  catalog.loaded = true
  catalog.campuses = [{ id: 1, name: '中关村', selection_policy: 'balanced' }]
  catalog.rooms = [{ id: 2, name: '诊室', address: '地址', campus_id: 1, enabled: true }]
  catalog.serviceDates = [{ id: 3, room_id: 2, date: '2099-01-02', startTime: '2099-01-02T09:00:00+08:00', endTime: '2099-01-02T10:00:00+08:00', capacity: 1, count, title: '服务' }]
  vi.spyOn(catalog, 'reload').mockResolvedValue(true)
  const tickets = useTicketsStore()
  tickets.workingLoaded = true
  return mount(Calendar, { global: { stubs: {
    InlineCalendar: { template: '<button @click="$emit(\'update:modelValue\', \'2099-01-02\')">选日期</button>', emits: ['update:modelValue'] }
  } } })
}

describe('appointment calendar', () => {
  it('allows selecting a full date and disables the full campus', async () => {
    const wrapper = setup(1)
    await wrapper.find('button').trigger('click')
    await wrapper.find('.campus-option').trigger('click')
    const button = wrapper.findAll('button').find((item) => item.text() === '该校区已约满')!
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('uses the backend recommendation when moving to the form', async () => {
    const wrapper = setup(0)
    vi.mocked(endpoints.recommendRoom).mockResolvedValue({ items: [], total: 1, page: 1, pageSize: 20, preferred_room_id: 2 })
    await wrapper.find('button').trigger('click')
    await wrapper.find('.campus-option').trigger('click')
    await wrapper.findAll('button').find((item) => item.text() === '下一步')!.trigger('click')
    await flushPromises()
    expect(endpoints.recommendRoom).toHaveBeenCalledWith(1, '2099-01-02')
    expect(push).toHaveBeenCalledWith({ name: 'record', query: { date: '2099-01-02', campus: '1', room: '2' } })
  })
})
