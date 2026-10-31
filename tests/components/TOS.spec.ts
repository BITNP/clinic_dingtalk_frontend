import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TOS from '@/components/TOS.vue'
import { useCatalogStore } from '@/stores/catalog'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('TOS popup', () => {
  it('emits update:show instead of mutating the prop', async () => {
    const catalog = useCatalogStore()
    catalog.announcements = [
      {
        id: 1,
        title: '免责声明',
        content: '请妥善备份数据。',
        tag: 'tos',
        enabled: true,
        brief: '免责声明',
        createdTime: '2026-09-01T08:00:00+08:00',
        lastEditedTime: '2026-09-01T08:00:00+08:00',
        expireDate: '2099-12-31T00:00:00+08:00',
        priority: 100
      }
    ]

    const wrapper = mount(TOS, {
      props: {
        show: true,
        'onUpdate:show': vi.fn()
      }
    })

    const close = wrapper.find('.van-icon-cross')
    expect(close.exists()).toBe(true)

    await close.trigger('click')
    expect(wrapper.emitted('update:show')?.[0]).toEqual([false])
  })
})
