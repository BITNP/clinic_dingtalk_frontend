import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TOS from '@/components/TOS.vue'
import { useCatalogStore } from '@/stores/catalog'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('TOS popup', () => {
  it('emits the model update instead of mutating the prop', async () => {
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
        modelValue: true,
        'onUpdate:modelValue': vi.fn()
      },
      global: {
        stubs: {
          teleport: true
        }
      }
    })

    const button = wrapper.find('button.weui-btn')
    expect(button.exists()).toBe(true)

    await button.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })
})
