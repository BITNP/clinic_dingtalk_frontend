import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Ticket } from '@/api/types'

vi.mock('vue-router', () => ({
  useRoute: () => ({ name: 'announcements' }),
  useRouter: () => ({ push: vi.fn() })
}))

import MainList from '@/views/MainList.vue'
import { useTicketsStore } from '@/stores/tickets'

function ticket(status: Ticket['status'] = 'confirmed'): Ticket {
  return {
    url: '/api/tickets/1',
    user: 'student01',
    status,
    realname: '张三',
    phone_num: '13800000000',
    campus: '北区医务室',
    appointment_time: '2026-11-02',
    description: '风扇异响',
    worker_description: '',
    model: 'ThinkPad X1',
    reject_reason: '',
    password: '',
    liquid_metal_status: 'unknown'
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('MainList new-ticket button', () => {
  it('is visible only when there is no working ticket', async () => {
    const tickets = useTicketsStore()
    tickets.workingLoaded = true
    tickets.working = null

    const wrapper = mount(MainList, {
      global: {
        stubs: {
          TopAnnouncements: true,
          Footer: true,
          RouterView: true
        }
      }
    })

    expect(wrapper.text()).toContain('新建工单')

    tickets.working = ticket()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('新建工单')
  })
})
