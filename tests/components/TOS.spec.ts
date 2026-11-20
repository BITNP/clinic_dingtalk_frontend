import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import TOS from '@/components/TOS.vue'
import { endpoints } from '@/api/endpoints'

vi.mock('@/api/endpoints', () => ({ endpoints: { listAnnouncements: vi.fn() } }))

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })

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
})
