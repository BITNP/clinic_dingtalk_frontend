import { api } from './client'
import type {
  Announcement,
  AnnouncementQuery,
  CreateTicketBody,
  Page,
  Room,
  ServiceDate,
  ServiceDateQuery,
  Ticket,
  UpdateTicketBody,
  WorkingTicketResponse
} from './types'

export const endpoints = {
  listAnnouncements(params: AnnouncementQuery = {}): Promise<Page<Announcement>> {
    return api
      .get<Page<Announcement>>('/announcements', { params })
      .then((response) => response.data)
  },

  listRooms(
    params: { enabled?: boolean; page?: number; pageSize?: number } = {}
  ): Promise<Page<Room>> {
    return api.get<Page<Room>>('/rooms', { params }).then((response) => response.data)
  },

  listServiceDates(params: ServiceDateQuery = {}): Promise<Page<ServiceDate>> {
    return api
      .get<Page<ServiceDate>>('/service-dates', { params })
      .then((response) => response.data)
  },

  getWorkingTicket(): Promise<WorkingTicketResponse> {
    return api.get<WorkingTicketResponse>('/tickets/working').then((response) => response.data)
  },

  getFinishedTickets(page = 1, pageSize = 20): Promise<Page<Ticket>> {
    return api
      .get<Page<Ticket>>('/tickets/finished', { params: { page, pageSize } })
      .then((response) => response.data)
  },

  createTicket(body: CreateTicketBody): Promise<Ticket> {
    return api.post<Ticket>('/tickets', body).then((response) => response.data)
  },

  updateTicket(id: number, body: UpdateTicketBody): Promise<Ticket> {
    return api.put<Ticket>(`/tickets/${id}`, body).then((response) => response.data)
  },

  deleteTicket(id: number): Promise<void> {
    return api.delete<void>(`/tickets/${id}`).then(() => undefined)
  }
}
