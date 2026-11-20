import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TicketDraft } from '@/api/types'

// Kept in memory only so returning to the calendar does not discard input.
export const useAppointmentDraftStore = defineStore('appointmentDraft', () => {
  const draft = ref<TicketDraft | null>(null)
  return { draft }
})
