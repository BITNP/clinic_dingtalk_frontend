import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { endpoints } from '@/api/endpoints'
import { errorMessage } from '@/api/errors'
import type { Ticket, TicketDraft } from '@/api/types'
import { draftToCreateBody, draftToUpdateBody, parseTicketId } from '@/domain/ticket'

import { useUiStore } from './ui'

export const FINISHED_PAGE_SIZE = 20

export const useTicketsStore = defineStore('tickets', () => {
  const ui = useUiStore()

  const working = ref<Ticket | null>(null)
  const workingLoaded = ref(false)
  const workingLoading = ref(false)

  const finished = ref<Ticket[]>([])
  const finishedTotal = ref(0)
  const finishedPage = ref(0)
  const finishedLoading = ref(false)
  const finishedError = ref('')

  const submitting = ref(false)

  const hasWorking = computed(() => Boolean(working.value))
  const hasMoreFinished = computed(() => finished.value.length < finishedTotal.value)

  async function refreshWorking(silent = false): Promise<void> {
    if (workingLoading.value) return
    workingLoading.value = true

    try {
      const response = await endpoints.getWorkingTicket()
      working.value = response.count > 0 && response.data ? response.data : null
    } catch (caught) {
      working.value = null
      if (!silent) {
        ui.error(errorMessage(caught, '无法获取当前工单'))
      }
    } finally {
      workingLoaded.value = true
      workingLoading.value = false
    }
  }

  function resetFinished(): void {
    finished.value = []
    finishedTotal.value = 0
    finishedPage.value = 0
    finishedError.value = ''
  }

  async function loadFinishedPage(page = finishedPage.value + 1): Promise<boolean> {
    if (finishedLoading.value) return true

    finishedLoading.value = true
    finishedError.value = ''

    try {
      const response = await endpoints.getFinishedTickets(page, FINISHED_PAGE_SIZE)
      const existing = new Set(finished.value.map((ticket) => ticket.url))
      const incoming = response.items.filter((ticket) => !existing.has(ticket.url))

      finished.value = finished.value.concat(incoming)
      finishedTotal.value = response.total
      finishedPage.value = response.page
      return true
    } catch (caught) {
      finishedError.value = errorMessage(caught, '无法获取已处理工单')
      ui.error(finishedError.value)
      return false
    } finally {
      finishedLoading.value = false
    }
  }

  async function createTicket(draft: TicketDraft): Promise<boolean> {
    if (submitting.value) return false
    submitting.value = true

    try {
      await endpoints.createTicket(draftToCreateBody(draft))
      await refreshWorking(true)
      ui.success('提交成功')
      return true
    } catch (caught) {
      ui.error(errorMessage(caught, '提交失败，请稍后重试'))
      return false
    } finally {
      submitting.value = false
    }
  }

  async function updateTicket(ticket: Ticket, draft: TicketDraft): Promise<boolean> {
    const id = parseTicketId(ticket.url)
    if (id === null) {
      ui.error('工单信息异常，无法更新')
      return false
    }
    if (submitting.value) return false
    submitting.value = true

    try {
      const updated = await endpoints.updateTicket(id, draftToUpdateBody(draft))
      if (working.value?.url === updated.url) {
        working.value = updated
      }
      ui.success('更新成功')
      return true
    } catch (caught) {
      ui.error(errorMessage(caught, '更新失败，请稍后重试'))
      return false
    } finally {
      submitting.value = false
    }
  }

  async function deleteTicket(ticket: Ticket): Promise<boolean> {
    const id = parseTicketId(ticket.url)
    if (id === null) {
      ui.error('工单信息异常，无法删除')
      return false
    }
    if (submitting.value) return false
    submitting.value = true

    try {
      await endpoints.deleteTicket(id)
      await refreshWorking(true)
      ui.success('已成功删除工单')
      return true
    } catch (caught) {
      ui.error(errorMessage(caught, '删除失败，请稍后重试'))
      return false
    } finally {
      submitting.value = false
    }
  }

  return {
    working,
    workingLoaded,
    workingLoading,
    finished,
    finishedTotal,
    finishedPage,
    finishedLoading,
    finishedError,
    submitting,
    hasWorking,
    hasMoreFinished,
    refreshWorking,
    resetFinished,
    loadFinishedPage,
    createTicket,
    updateTicket,
    deleteTicket
  }
})
