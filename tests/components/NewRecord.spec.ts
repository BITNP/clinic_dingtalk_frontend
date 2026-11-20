import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import NewRecord from '@/views/NewRecord.vue'
import { useCatalogStore } from '@/stores/catalog'
import { useTicketsStore } from '@/stores/tickets'
import { useAppointmentDraftStore } from '@/stores/appointmentDraft'

const route = { query: { date: '2099-01-02', campus: '1', room: '2' } }
const replace = vi.fn()
vi.mock('vue-router', () => ({ useRoute: () => route, useRouter: () => ({ replace, push: vi.fn() }), onBeforeRouteLeave: vi.fn() }))

beforeEach(() => {
  setActivePinia(createPinia())
  replace.mockReset()
  route.query.date = '2099-01-02'
})

function setup() {
  const catalog = useCatalogStore()
  catalog.campuses = [{ id: 1, name: '校区', selection_policy: 'balanced' }]
  catalog.rooms = [{ id: 2, name: '诊室', address: '地址', campus_id: 1, enabled: true }]
  catalog.serviceDates = [{ id: 3, room_id: 2, date: '2099-01-02', startTime: '2099-01-02T09:00:00+08:00', endTime: '2099-01-02T10:00:00+08:00', capacity: 1, count: 0, title: '服务' }]
  catalog.announcements = [{ id: 1, content: '声明', tag: 'tos', enabled: true, priority: 1 } as never]
  vi.spyOn(catalog, 'reload').mockResolvedValue(true)
  const tickets = useTicketsStore()
  vi.spyOn(tickets, 'refreshWorking').mockResolvedValue(true)
  const create = vi.spyOn(tickets, 'createTicket').mockResolvedValue(true)
  useAppointmentDraftStore().draft = { campus: '', appointment_time: '', description: '问题', realname: '张三', phone_num: '13800000000', model: '', password: '' }
  const wrapper = mount(NewRecord, { global: { stubs: {
    RecordForm: true,
    TOS: { template: '<button @click="$emit(\'agree\', \'声明\')">同意</button>', emits: ['agree'] },
    VuxHeader: true
  } } })
  return { wrapper, catalog, tickets, create }
}

describe('new appointment validation', () => {
  it('rejects agreement when the disclaimer disappears on refresh', async () => {
    const { wrapper, catalog, create } = setup()
    await flushPromises()
    await wrapper.findAll('button').find((button) => button.text() === '同意')!.trigger('click')
    vi.mocked(catalog.reload).mockImplementation(async () => { catalog.announcements = []; return true })
    await wrapper.findAll('button').find((button) => button.text() === '提交预约')!.trigger('click')
    await flushPromises()
    expect(create).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('阅读免责声明')
  })

  it('redirects direct access for a user with a working appointment', async () => {
    const { tickets } = setup()
    tickets.working = { status: 'pending' } as never
    await flushPromises()
    expect(replace).toHaveBeenCalledWith({ name: 'calendar' })
  })

  it('redirects past dates before showing the form', async () => {
    route.query.date = '2000-01-01'
    setup()
    await flushPromises()
    expect(replace).toHaveBeenCalledWith({ name: 'calendar' })
  })
})
