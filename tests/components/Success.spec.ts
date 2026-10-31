import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: { title: '已成功删除工单' } }),
  useRouter: () => ({ push: vi.fn() })
}))

import Success from '@/views/Success.vue'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('Success page', () => {
  it('reads the title from the route query instead of discarding it', () => {
    const wrapper = mount(Success)
    expect(wrapper.text()).toContain('已成功删除工单')
  })
})
