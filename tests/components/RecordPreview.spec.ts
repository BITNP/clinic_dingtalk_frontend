import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { Ticket, TicketStatus } from '@/api/types'
import RecordPreview from '@/components/RecordPreview.vue'

function record(status: TicketStatus): Ticket {
  return {
    url: '/api/tickets/1', user: 'test', status, realname: '', phone_num: '', campus: '',
    appointment_time: '', description: '', worker_description: '', model: '',
    reject_reason: '', password: '', liquid_metal_status: ''
  }
}

describe('appointment progress', () => {
  it.each([
    ['pending', ['active', 'future', 'future'], [true, false, false, false], '正在审核'],
    ['confirmed', ['done', 'active', 'future'], [true, true, false, false], '可以前往诊所'],
    ['arrived', ['done', 'done', 'active'], [true, true, true, false], '等待服务'],
    ['in_progress', ['done', 'done', 'active'], [true, true, true, false], '正在服务'],
    ['completed', ['done', 'done', 'done'], [true, true, true, true], '']
  ] as [TicketStatus, string[], boolean[], string][])('shows only reached progress for %s', (status, expectedLines, expectedNodes, tip) => {
    const wrapper = mount(RecordPreview, { props: { record: record(status) } })
    const lines = wrapper.findAll('.weui-wepay-flow__line').map((line) =>
      line.classes().includes('weui-wepay-flow__line_done') ? 'done' : line.classes().includes('weui-wepay-flow__line_ing') ? 'active' : 'future'
    )
    expect(lines).toEqual(expectedLines)
    expect(wrapper.findAll('.weui-wepay-flow__li').map((node) => node.classes().includes('weui-wepay-flow__li_done'))).toEqual(expectedNodes)
    expect(wrapper.findAll('.weui-wepay-flow__info-top').map((node) => node.text())).toEqual(tip ? [tip] : [])
  })

  it.each([
    ['rejected', '预约已驳回'], ['referred', '建议返厂'], ['no_show', '未到诊所']
  ] as [TicketStatus, string][])('does not claim service was completed for %s', (status, label) => {
    const wrapper = mount(RecordPreview, { props: { record: record(status) } })
    expect(wrapper.find('.weui-wepay-flow').exists()).toBe(false)
    expect(wrapper.find('.weui-form-preview__value').text()).toBe(label)
  })
})
