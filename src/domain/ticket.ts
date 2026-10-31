import type {
  CreateTicketBody,
  PreviewItem,
  Ticket,
  TicketDraft,
  UpdateTicketBody
} from '@/api/types'

import { formatDateOnly } from './format'

const PHONE_PATTERN = /^1[3-9]\d{9}$/

export function parseTicketId(url?: string | null): number | null {
  if (!url) return null
  const match = /\/api\/tickets\/(\d+)(?:\/)?(?:[?#].*)?$/.exec(url)
  if (!match) return null
  const id = Number(match[1])
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

export function formatTicketNo(url?: string | null): string {
  const id = parseTicketId(url)
  return id === null ? '—' : String(id).padStart(8, '0')
}

export function buildPreviewItems(ticket: Ticket): PreviewItem[] {
  const items: PreviewItem[] = [{ label: '工单号', value: formatTicketNo(ticket.url) }]

  const fields: Array<[keyof Ticket, string]> = [
    ['appointment_time', '预约时间'],
    ['description', '问题描述'],
    ['model', '电脑型号'],
    ['campus', '校区'],
    ['phone_num', '手机号'],
    ['realname', '真实姓名'],
    ['worker_description', '工作人员说明'],
    ['reject_reason', '驳回原因']
  ]

  for (const [key, label] of fields) {
    const raw = ticket[key]
    if (typeof raw !== 'string' || !raw.trim()) continue
    const value = key === 'appointment_time' ? formatDateOnly(raw) : raw
    if (value) {
      items.push({ label, value })
    }
  }

  return items
}

export function ticketToDraft(ticket: Ticket): TicketDraft {
  return {
    campus: ticket.campus,
    appointment_time: formatDateOnly(ticket.appointment_time),
    description: ticket.description,
    realname: ticket.realname,
    phone_num: ticket.phone_num,
    model: ticket.model,
    password: ''
  }
}

function optional(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export function draftToCreateBody(draft: TicketDraft): CreateTicketBody {
  return {
    realname: draft.realname.trim(),
    phone_num: draft.phone_num.trim(),
    campus: draft.campus.trim(),
    appointment_time: draft.appointment_time.trim(),
    description: draft.description.trim(),
    model: optional(draft.model),
    password: optional(draft.password)
  }
}

export function draftToUpdateBody(draft: TicketDraft): UpdateTicketBody {
  return {
    realname: draft.realname.trim(),
    phone_num: draft.phone_num.trim(),
    campus: draft.campus.trim(),
    appointment_time: draft.appointment_time.trim(),
    description: draft.description.trim(),
    model: draft.model.trim(),
    // Empty means "leave the stored password unchanged".
    password: optional(draft.password)
  }
}

export function validateDraft(draft: TicketDraft): string | null {
  if (!draft.campus.trim()) return '请选择校区'
  if (!draft.appointment_time.trim()) return '请选择预约时间'
  if (!draft.description.trim()) return '请填写问题描述'
  if (draft.description.trim().length > 600) return '问题描述不能超过 600 个字符'
  if (!draft.realname.trim()) return '请填写真实姓名'
  if (draft.realname.trim().length > 50) return '真实姓名不能超过 50 个字符'
  if (!draft.phone_num.trim()) return '请填写手机号'
  if (!PHONE_PATTERN.test(draft.phone_num.trim())) return '请输入正确的手机号'
  if (draft.model.trim().length > 200) return '电脑型号不能超过 200 个字符'
  return null
}
