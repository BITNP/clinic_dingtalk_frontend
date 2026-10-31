import type { TicketStatus } from '@/api/types'

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  pending: '预约待确认',
  confirmed: '预约已确认',
  arrived: '已到诊所',
  in_progress: '正在处理',
  completed: '已解决问题',
  rejected: '预约已驳回',
  referred: '建议返厂',
  no_show: '未到诊所'
}

export const WORKING_STATUSES: TicketStatus[] = ['pending', 'confirmed', 'arrived', 'in_progress']

export const FINISHED_STATUSES: TicketStatus[] = [
  'rejected',
  'completed',
  'referred',
  'no_show'
]

export type StatusTagType = 'primary' | 'success' | 'danger' | 'warning' | ''

export function isWorkingStatus(status: TicketStatus): boolean {
  return WORKING_STATUSES.includes(status)
}

export function isEditableStatus(status: TicketStatus): boolean {
  return WORKING_STATUSES.includes(status)
}

export function isFinishedStatus(status: TicketStatus): boolean {
  return FINISHED_STATUSES.includes(status)
}

export function statusLabel(status: TicketStatus): string {
  return TICKET_STATUS_LABELS[status] ?? status
}

export function statusTagType(status: TicketStatus): StatusTagType {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'confirmed':
      return 'primary'
    case 'arrived':
    case 'in_progress':
      return 'primary'
    case 'completed':
      return 'success'
    case 'rejected':
      return 'danger'
    case 'referred':
      return 'warning'
    case 'no_show':
      return 'danger'
    default:
      return ''
  }
}

export interface StatusStep {
  title: string
  done: boolean
  current: boolean
  tip?: string
}

export function buildStatusSteps(status: TicketStatus): StatusStep[] {
  const reviewed = ['confirmed', 'arrived', 'in_progress', 'completed'].includes(status)
  const arrived = ['arrived', 'in_progress', 'completed'].includes(status)
  const completed = status === 'completed'

  return [
    {
      title: '创建工单',
      done: true,
      current: false
    },
    {
      title: '审核通过',
      done: reviewed,
      current: status === 'pending',
      tip: status === 'pending' ? '正在审核' : undefined
    },
    {
      title: '已到诊所',
      done: arrived,
      current: status === 'confirmed',
      tip: status === 'confirmed' ? '可以前往诊所' : undefined
    },
    {
      title: '完成服务',
      done: completed,
      current: status === 'arrived' || status === 'in_progress' || completed,
      tip:
        status === 'arrived'
          ? '请到前台登记'
          : status === 'in_progress'
            ? '正在服务'
            : status === 'completed'
              ? '服务已完成'
              : undefined
    }
  ]
}

export interface TerminalInfo {
  label: string
  type: StatusTagType
}

export function terminalInfo(status: TicketStatus): TerminalInfo | null {
  switch (status) {
    case 'rejected':
      return { label: '本次预约已被驳回', type: 'danger' }
    case 'referred':
      return { label: '建议返厂维修', type: 'warning' }
    case 'no_show':
      return { label: '本次预约未到诊所', type: 'danger' }
    default:
      return null
  }
}
