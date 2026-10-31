export type AnnouncementTag = 'normal' | 'pinned' | 'tos'

export interface Announcement {
  id: number
  title: string
  content: string
  tag: AnnouncementTag
  enabled: boolean
  brief: string
  createdTime: string
  lastEditedTime: string
  expireDate: string
  priority: number
}

export interface Room {
  id: number
  name: string
  address: string
  enabled: boolean
}

export interface ServiceDate {
  id: number
  capacity: number
  room_id: number | null
  date: string
  startTime: string
  endTime: string
  title: string
  count: number
}

export type TicketStatus =
  | 'pending'
  | 'confirmed'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'referred'
  | 'no_show'

export interface Ticket {
  url: string
  user: string
  status: TicketStatus
  realname: string
  phone_num: string
  campus: string
  appointment_time: string
  description: string
  worker_description: string
  model: string
  reject_reason: string
  password: string
  liquid_metal_status: string
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface WorkingTicketResponse {
  count: number
  data?: Ticket
}

export interface TicketDraft {
  campus: string
  appointment_time: string
  description: string
  realname: string
  phone_num: string
  model: string
  /** Empty string means "keep the existing password" when editing. */
  password: string
}

export interface CreateTicketBody {
  realname: string
  phone_num: string
  campus: string
  appointment_time: string
  description: string
  model?: string
  password?: string
}

export interface UpdateTicketBody {
  realname?: string
  phone_num?: string
  campus?: string
  appointment_time?: string
  description?: string
  model?: string
  password?: string
}

export interface PreviewItem {
  label: string
  value: string
}

export interface UserStatusResponse {
  status: number
  student_id?: string | number
}

export interface ListQuery {
  page?: number
  pageSize?: number
}

export interface AnnouncementQuery extends ListQuery {
  active?: boolean
  tag?: AnnouncementTag
}

export interface ServiceDateQuery extends ListQuery {
  active?: boolean
  room_id?: number
  available?: boolean
  from?: string
  to?: string
}
