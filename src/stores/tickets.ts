import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { endpoints } from '@/api/endpoints'
import { errorMessage, toApiError } from '@/api/errors'
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
  const createUncertain = ref(false)
  const uncertainChecked = ref(false)
  const lastCreated = ref<Ticket | null>(null)
  let workingVersion = 0
  let recordsSwap: ((isCurrent: () => boolean) => Promise<void>) | null = null

  const hasWorking = computed(() => Boolean(working.value))
  const hasMoreFinished = computed(() => finished.value.length < finishedTotal.value)

  let workingRequest: Promise<boolean> | null = null
  let workingRequestVersion = 0
  function refreshWorking(silent = false): Promise<boolean> {
    if (workingRequest) {
      if (workingRequestVersion === workingVersion) return workingRequest
      return workingRequest.then(() => refreshWorking(silent))
    }
    workingRequest = loadWorking(silent).finally(() => { workingRequest = null })
    workingRequestVersion = workingVersion
    return workingRequest
  }

  async function loadWorking(silent: boolean): Promise<boolean> {
    workingLoading.value = true
    const version = ++workingVersion

    try {
      const response = await endpoints.getWorkingTicket()
      if (version !== workingVersion) return false
      working.value = response.count > 0 && response.data ? response.data : null
      workingLoaded.value = true
      return true
    } catch (caught) {
      if (version !== workingVersion) return false
      workingLoaded.value = false
      if (!silent) {
        ui.error(errorMessage(caught, '无法获取当前预约'))
      }
      return false
    } finally {
      workingLoading.value = false
    }
  }

  async function swapWorking(isCurrent: () => boolean = () => true): Promise<void> {
    if (workingRequest) await workingRequest
    if (submitting.value) throw new Error('ticket mutation in progress')
    const version = ++workingVersion
    const response = await endpoints.getWorkingTicket()
    if (!isCurrent() || version !== workingVersion || submitting.value) throw new Error('ticket snapshot superseded')
    working.value = response.count > 0 && response.data ? response.data : null
    workingLoaded.value = true
  }

  function registerRecordsSwap(callback: (isCurrent: () => boolean) => Promise<void>): () => void {
    recordsSwap = callback
    return () => { if (recordsSwap === callback) recordsSwap = null }
  }

  async function swapRecords(isCurrent: () => boolean = () => true): Promise<void> {
    if (recordsSwap) await recordsSwap(isCurrent)
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
      finishedError.value = errorMessage(caught, '无法获取已处理预约')
      ui.error(finishedError.value)
      return false
    } finally {
      finishedLoading.value = false
    }
  }

  async function createTicket(draft: TicketDraft): Promise<boolean> {
    if (submitting.value || createUncertain.value) return false
    submitting.value = true
    workingVersion++

    try {
      const created = await endpoints.createTicket(draftToCreateBody(draft))
      lastCreated.value = { ...created, password: '' }
      await refreshWorking(true)
      ui.success('提交成功')
      return true
    } catch (caught) {
      const status = toApiError(caught).status
      if (status === undefined || status >= 500) {
        createUncertain.value = true
        uncertainChecked.value = false
        await refreshWorking(true)
        ui.error('提交结果尚未确认，请查看预约状态')
      } else {
        ui.error(errorMessage(caught, '提交失败，请稍后重试'))
      }
      return false
    } finally {
      submitting.value = false
    }
  }

  async function checkUncertainCreate(): Promise<boolean> {
    const ok = await refreshWorking()
    if (ok) {
      if (working.value) createUncertain.value = false
      else uncertainChecked.value = true
    }
    return ok
  }

  async function updateTicket(ticket: Ticket, draft: TicketDraft): Promise<boolean> {
    const id = parseTicketId(ticket.url)
    if (id === null) {
      ui.error('预约信息异常，无法更新')
      return false
    }
    if (submitting.value) return false
    submitting.value = true
    workingVersion++

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
      ui.error('预约信息异常，无法删除')
      return false
    }
    if (submitting.value) return false
    submitting.value = true
    workingVersion++

    try {
      await endpoints.deleteTicket(id)
      await refreshWorking(true)
      ui.success('已成功取消预约')
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
    createUncertain,
    uncertainChecked,
    lastCreated,
    hasWorking,
    hasMoreFinished,
    refreshWorking,
    swapWorking,
    registerRecordsSwap,
    swapRecords,
    resetFinished,
    loadFinishedPage,
    createTicket,
    checkUncertainCreate,
    updateTicket,
    deleteTicket
  }
})
