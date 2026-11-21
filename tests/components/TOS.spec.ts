import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import TOS from '@/components/TOS.vue'
import { endpoints } from '@/api/endpoints'
import { useCatalogStore } from '@/stores/catalog'

vi.mock('@/api/endpoints', () => ({ endpoints: { listAnnouncements: vi.fn() } }))

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })
beforeEach(() => { setActivePinia(createPinia()) })

describe('TOS popup', () => {
  it('requires five visible seconds before agreeing and resets on reopening', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'performance'] })
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
    vi.mocked(endpoints.listAnnouncements).mockResolvedValue({
      items: [{ id: 1, content: '请备份数据', priority: 1 } as never], total: 1, page: 1, pageSize: 100
    })
    const wrapper = mount(TOS, { props: { modelValue: true }, global: { stubs: { teleport: true } } })
    await flushPromises()
    const agree = () => wrapper.findAll('button').find((button) => button.text().includes('同意并继续'))!
    expect(agree().attributes('disabled')).toBeDefined()
    await vi.advanceTimersByTimeAsync(4900)
    expect(agree().attributes('disabled')).toBeDefined()
    await vi.advanceTimersByTimeAsync(100)
    expect(agree().attributes('disabled')).toBeUndefined()
    await agree().trigger('click')
    expect(wrapper.emitted('agree')?.[0]).toEqual(['请备份数据'])
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    await wrapper.setProps({ modelValue: false })
    await wrapper.setProps({ modelValue: true })
    await flushPromises()
    expect(agree().attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('does not allow agreement when loading fails', async () => {
    vi.mocked(endpoints.listAnnouncements).mockRejectedValue(new Error('offline'))
    const wrapper = mount(TOS, { props: { modelValue: true }, global: { stubs: { teleport: true } } })
    await flushPromises()
    expect(wrapper.text()).toContain('加载失败')
    expect(wrapper.findAll('button').find((button) => button.text().includes('同意并继续'))?.attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('does not count time spent in a background tab', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'performance'] })
    let hidden = false
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
    vi.mocked(endpoints.listAnnouncements).mockResolvedValue({
      items: [{ id: 1, content: '请备份数据', priority: 1 } as never], total: 1, page: 1, pageSize: 100
    })
    const wrapper = mount(TOS, { props: { modelValue: true }, global: { stubs: { teleport: true } } })
    await flushPromises()
    await vi.advanceTimersByTimeAsync(2000)
    hidden = true
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(10000)
    hidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    const agree = () => wrapper.findAll('button').find((button) => button.text().includes('同意并继续'))!
    expect(agree().attributes('disabled')).toBeDefined()
    await vi.advanceTimersByTimeAsync(3000)
    expect(agree().attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })

  it('restarts the timer if the displayed disclaimer changes', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'performance'] })
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
    const response = (content: string) => ({ items: [{ id: 1, content, priority: 1 } as never], total: 1, page: 1, pageSize: 100 })
    vi.mocked(endpoints.listAnnouncements).mockResolvedValueOnce(response('旧声明')).mockResolvedValueOnce(response('新声明'))
    const wrapper = mount(TOS, { props: { modelValue: true }, global: { stubs: { teleport: true } } })
    await flushPromises()
    await vi.advanceTimersByTimeAsync(5000)
    useCatalogStore().announcements = [{ id: 1, tag: 'tos', content: '新声明', priority: 1 } as never]
    await flushPromises()
    expect(wrapper.text()).toContain('新声明')
    expect(wrapper.findAll('button').find((button) => button.text().includes('同意并继续'))?.attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })
})
