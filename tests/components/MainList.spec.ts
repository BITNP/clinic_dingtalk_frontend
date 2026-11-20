import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

vi.mock('vue-router', () => ({
  useRoute: () => ({ name: 'announcements' }),
  useRouter: () => ({ push: vi.fn() })
}))
import MainList from '@/views/MainList.vue'

describe('main navigation', () => {
  it('shows the three unified tabs', () => {
    const wrapper = mount(MainList, { global: { stubs: { Footer: true, RouterView: true } } })
    expect(wrapper.text()).toContain('首页')
    expect(wrapper.text()).toContain('诊所服务日历')
    expect(wrapper.text()).toContain('预约记录')
    expect(wrapper.text()).not.toContain('已处理')
  })
})
