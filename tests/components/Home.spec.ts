import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Home from '@/views/Home.vue'
import { endpoints } from '@/api/endpoints'
import { useCatalogStore } from '@/stores/catalog'
import { useTicketsStore } from '@/stores/tickets'

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/api/endpoints', () => ({ endpoints: { listAnnouncements: vi.fn() } }))

beforeEach(() => { setActivePinia(createPinia()); vi.clearAllMocks() })

function setup() {
  const catalog = useCatalogStore()
  vi.spyOn(catalog, 'ensure').mockResolvedValue(true)
  const tickets = useTicketsStore()
  vi.spyOn(tickets, 'refreshWorking').mockResolvedValue(true)
  return { catalog, tickets, wrapper: mount(Home, { global: { stubs: { teleport: true } } }) }
}

describe('home', () => {
  it('renders announcement title, summary and detail as sanitized Markdown', async () => {
    vi.mocked(endpoints.listAnnouncements).mockResolvedValue({
      items: [{ id: 1, title: '**重要**', brief: '摘要 [链接](https://example.com)\n\n- 列表', content: '## 正文\n\n<script>alert(1)</script>', tag: 'normal', priority: 1, lastEditedTime: '2099-01-01' } as never],
      total: 1, page: 1, pageSize: 100
    })
    const { wrapper } = setup()
    await flushPromises()
    expect(wrapper.find('.weui-media-box__title strong').text()).toBe('重要')
    expect(wrapper.find('.weui-media-box__desc li').text()).toBe('列表')
    const link = wrapper.find('.weui-media-box__desc a')
    expect(link.attributes('href')).toBe('https://example.com')
    link.element.addEventListener('click', (event) => event.preventDefault())
    await link.trigger('click')
    expect(wrapper.find('.card-padding').exists()).toBe(false)
    await wrapper.find('.weui-media-box').trigger('click')
    expect(wrapper.find('.card-padding h2').text()).toBe('正文')
    expect(wrapper.find('.announcement-dialog__actions button').text()).toBe('确认')
    expect(wrapper.find('.announcement-dialog__content button').exists()).toBe(false)
    expect(wrapper.find('.card-padding script').exists()).toBe(false)
    expect(wrapper.find('.weui-cell__ft strong').text()).toBe('重要')
  })
  it('shows the current appointment and location even if announcements fail', async () => {
    vi.mocked(endpoints.listAnnouncements).mockRejectedValue(new Error('offline'))
    const { wrapper, catalog, tickets } = setup()
    catalog.rooms = [{ id: 2, name: '一号诊室', address: '3号楼', campus_id: 1, enabled: true }]
    catalog.campuses = [{ id: 1, name: '中关村', selection_policy: 'balanced' }]
    tickets.workingLoaded = true
    tickets.working = { url: '/api/tickets/5', status: 'confirmed', campus: '一号诊室', appointment_time: '2099-01-02' } as never
    await flushPromises()
    expect(wrapper.text()).toContain('公告加载失败')
    expect(wrapper.text()).toContain('中关村')
    expect(wrapper.text()).toContain('3号楼')
    expect(wrapper.text()).toContain('查看当前预约')
    expect(wrapper.text()).not.toContain('新建预约')
  })

  it('shows retry instead of an empty appointment when status fails', async () => {
    vi.mocked(endpoints.listAnnouncements).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 100 })
    const { wrapper } = setup()
    await flushPromises()
    expect(wrapper.text()).toContain('预约状态加载失败')
    expect(wrapper.text()).not.toContain('暂无未完成预约')
    expect(wrapper.text()).not.toContain('新建预约')
  })
})
