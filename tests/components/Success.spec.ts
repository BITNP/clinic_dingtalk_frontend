import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: { title: '已成功删除工单' } }),
  useRouter: () => ({ push })
}))

import Success from '@/views/Success.vue'
import { useTicketsStore } from '@/stores/tickets'

beforeEach(() => {
  setActivePinia(createPinia())
  push.mockReset()
})

describe('Success page', () => {
  it('reads the title from the route query instead of discarding it', () => {
    const wrapper = mount(Success)
    expect(wrapper.text()).toContain('已成功删除工单')
  })

  it('returns to the visible home child and refreshes the working appointment', async () => {
    const tickets = useTicketsStore()
    const refresh = vi.spyOn(tickets, 'refreshWorking').mockResolvedValue(true)
    const wrapper = mount(Success)

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(push).toHaveBeenCalledWith({ name: 'announcements' })
    expect(refresh).toHaveBeenCalledOnce()
  })
})
