import { describe, expect, it } from 'vitest'

import type { Ticket } from '@/api/types'
import {
  buildPreviewItems,
  draftToCreateBody,
  draftToUpdateBody,
  formatTicketNo,
  parseTicketId,
  ticketToDraft,
  validateDraft
} from '@/domain/ticket'
import workingFixture from '../fixtures/api/ticket-working.json'

const ticket = workingFixture.data as unknown as Ticket

describe('parseTicketId', () => {
  it('parses the new ticket URL shape', () => {
    expect(parseTicketId('/api/tickets/42')).toBe(42)
    expect(parseTicketId('/api/tickets/42/')).toBe(42)
  })

  it('returns null for malformed or legacy URLs', () => {
    expect(parseTicketId(undefined)).toBeNull()
    expect(parseTicketId('')).toBeNull()
    expect(parseTicketId('/api/wechat/42/')).toBeNull()
    expect(parseTicketId('/api/tickets/not-a-number')).toBeNull()
    expect(parseTicketId('/api/tickets/0')).toBeNull()
  })

  it('formats a padded ticket number', () => {
    expect(formatTicketNo('/api/tickets/42')).toBe('00000042')
    expect(formatTicketNo(undefined)).toBe('—')
  })
})

describe('buildPreviewItems', () => {
  it('shows the worker description and never shows the password', () => {
    const items = buildPreviewItems(ticket)
    const labels = items.map((item) => item.label)

    expect(labels).toContain('工作人员说明')
    expect(items.find((item) => item.label === '工作人员说明')?.value).toBe('已更换风扇。')
    expect(labels).not.toContain('电脑开机密码')
    expect(items.some((item) => item.value === ticket.password)).toBe(false)
  })

  it('formats the appointment date without a timezone shift', () => {
    const items = buildPreviewItems(ticket)
    expect(items.find((item) => item.label === '预约时间')?.value).toBe('2026-11-02')
  })
})

describe('ticket drafts', () => {
  it('does not preload the stored password into the edit form', () => {
    expect(ticketToDraft(ticket).password).toBe('')
  })

  it('does not send an empty password when updating', () => {
    const draft = ticketToDraft(ticket)
    expect(draftToUpdateBody(draft).password).toBeUndefined()

    draft.password = 'new-secret'
    expect(draftToUpdateBody(draft).password).toBe('new-secret')
  })

  it('omits optional blank fields when creating', () => {
    const body = draftToCreateBody({
      campus: '北区医务室',
      appointment_time: '2026-11-02',
      description: '风扇异响',
      realname: '张三',
      phone_num: '13800000000',
      model: '  ',
      password: ''
    })

    expect(body.model).toBeUndefined()
    expect(body.password).toBeUndefined()
  })
})

describe('validateDraft', () => {
  const valid = {
    campus: '北区医务室',
    appointment_time: '2026-11-02',
    description: '风扇异响',
    realname: '张三',
    phone_num: '13800000000',
    model: '',
    password: ''
  }

  it('accepts a complete draft', () => {
    expect(validateDraft(valid)).toBeNull()
  })

  it('rejects an invalid mobile number', () => {
    expect(validateDraft({ ...valid, phone_num: '12345' })).toBe('请输入正确的手机号')
  })

  it('rejects missing required fields', () => {
    expect(validateDraft({ ...valid, campus: '' })).toBe('请选择校区')
    expect(validateDraft({ ...valid, description: '' })).toBe('请填写问题描述')
  })
})
