import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Announcement } from '@/api/types'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() })
}))

import TopAnnouncements from '@/components/TopAnnouncements.vue'
import { useCatalogStore } from '@/stores/catalog'

function announcement(id: number, brief: string): Announcement {
  return {
    id,
    title: `公告 ${id}`,
    content: '',
    tag: 'pinned',
    enabled: true,
    brief,
    createdTime: '2026-10-20T08:00:00+08:00',
    lastEditedTime: '2026-10-20T08:00:00+08:00',
    expireDate: '2026-12-31T00:00:00+08:00',
    priority: 10
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('TopAnnouncements', () => {
  it('rotates pinned announcements and clears its timer on unmount', async () => {
    const catalog = useCatalogStore()
    catalog.announcements = [announcement(1, '第一条'), announcement(2, '第二条')]

    const wrapper = mount(TopAnnouncements)
    // The catalog orders announcements by priority/id, so the newer pinned
    // announcement is shown first.
    expect(wrapper.text()).toContain('第二条')
    expect(vi.getTimerCount()).toBeGreaterThanOrEqual(1)

    vi.advanceTimersByTime(5000)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('第一条')

    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('does not create a timer when there are no pinned announcements', () => {
    const catalog = useCatalogStore()
    catalog.announcements = []

    const wrapper = mount(TopAnnouncements)
    expect(wrapper.text()).toBe('')
    expect(vi.getTimerCount()).toBe(0)

    wrapper.unmount()
  })
})
