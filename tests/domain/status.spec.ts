import { describe, expect, it } from 'vitest'

import {
  buildStatusSteps,
  isEditableStatus,
  statusLabel,
  statusTagType,
  terminalInfo
} from '@/domain/status'

describe('ticket status mapping', () => {
  it('maps every new API status to a Chinese label', () => {
    expect(statusLabel('pending')).toBe('预约待确认')
    expect(statusLabel('confirmed')).toBe('预约已确认')
    expect(statusLabel('arrived')).toBe('已到诊所')
    expect(statusLabel('in_progress')).toBe('正在处理')
    expect(statusLabel('completed')).toBe('已解决问题')
    expect(statusLabel('rejected')).toBe('预约已驳回')
    expect(statusLabel('referred')).toBe('建议返厂')
    expect(statusLabel('no_show')).toBe('未到诊所')
  })

  it('only allows editing unfinished tickets', () => {
    expect(isEditableStatus('pending')).toBe(true)
    expect(isEditableStatus('confirmed')).toBe(true)
    expect(isEditableStatus('arrived')).toBe(true)
    expect(isEditableStatus('in_progress')).toBe(true)
    expect(isEditableStatus('completed')).toBe(false)
    expect(isEditableStatus('rejected')).toBe(false)
  })

  it('uses distinct tag types for terminal states', () => {
    expect(statusTagType('completed')).toBe('success')
    expect(statusTagType('rejected')).toBe('danger')
    expect(statusTagType('referred')).toBe('warning')
    expect(terminalInfo('rejected')?.label).toContain('驳回')
    expect(terminalInfo('completed')).toBeNull()
  })
})

describe('buildStatusSteps', () => {
  it('marks review as the current step for pending tickets', () => {
    const steps = buildStatusSteps('pending')
    expect(steps[0].done).toBe(true)
    expect(steps[1].current).toBe(true)
    expect(steps[1].tip).toBe('正在审核')
  })

  it('marks arrival as the current step for confirmed tickets', () => {
    const steps = buildStatusSteps('confirmed')
    expect(steps[1].done).toBe(true)
    expect(steps[2].current).toBe(true)
    expect(steps[2].tip).toBe('可以前往诊所')
  })

  it('marks the service step as current while in progress', () => {
    const steps = buildStatusSteps('in_progress')
    expect(steps[2].done).toBe(true)
    expect(steps[3].current).toBe(true)
    expect(steps[3].tip).toBe('正在服务')
  })

  it('completes every step for a completed ticket', () => {
    expect(buildStatusSteps('completed').every((step) => step.done)).toBe(true)
  })
})
