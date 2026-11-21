import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { endpoints } from '@/api/endpoints'
import { errorMessage } from '@/api/errors'
import { fetchAllPages } from '@/api/pagination'
import type { Announcement, Campus, Room, ServiceDate } from '@/api/types'
import { buildDateOptions, joinServiceDates } from '@/domain/catalog'

import { useUiStore } from './ui'

export const useCatalogStore = defineStore('catalog', () => {
  const ui = useUiStore()

  const rooms = ref<Room[]>([])
  const campuses = ref<Campus[]>([])
  const serviceDates = ref<ServiceDate[]>([])
  const announcements = ref<Announcement[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref('')
  const announcementsLoading = ref(false)
  const announcementsLoaded = ref(false)
  const announcementsError = ref(false)
  let locationVersion = 0
  let announcementPending: Promise<void> | null = null

  let pending: Promise<boolean> | null = null
  function reloadLocations(): Promise<boolean> {
    if (pending) return pending
    pending = loadLocations().finally(() => { pending = null })
    return pending
  }

  async function loadLocations(): Promise<boolean> {
    const version = ++locationVersion
    loading.value = true
    error.value = ''

    try {
      const [campusItems, roomItems, dateItems] = await Promise.all([
        fetchAllPages((page, pageSize) => endpoints.listCampuses({ page, pageSize })),
        fetchAllPages((page, pageSize) => endpoints.listRooms({ enabled: true, page, pageSize })),
        fetchAllPages((page, pageSize) =>
          endpoints.listServiceDates({ active: true, page, pageSize })
        )
      ])

      if (version !== locationVersion) return false
      campuses.value = campusItems
      rooms.value = roomItems
      serviceDates.value = dateItems
      loaded.value = true
      return true
    } catch (caught) {
      error.value = errorMessage(caught, '无法获取诊所信息')
      ui.error(error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  async function swapLocations(isCurrent: () => boolean = () => true): Promise<void> {
    if (pending) await pending
    const version = ++locationVersion
    const [campusItems, roomItems, dateItems] = await Promise.all([
      fetchAllPages((page, pageSize) => endpoints.listCampuses({ page, pageSize })),
      fetchAllPages((page, pageSize) => endpoints.listRooms({ enabled: true, page, pageSize })),
      fetchAllPages((page, pageSize) => endpoints.listServiceDates({ active: true, page, pageSize }))
    ])
    if (!isCurrent() || version !== locationVersion) throw new Error('location snapshot superseded')
    campuses.value = campusItems
    rooms.value = roomItems
    serviceDates.value = dateItems
    loaded.value = true
    error.value = ''
  }

  async function fetchAnnouncements(isCurrent: () => boolean = () => true): Promise<void> {
    while (announcementPending) await announcementPending.catch(() => undefined)
    if (!isCurrent()) throw new Error('announcement request cancelled')
    announcementPending = (async () => {
      const items = await fetchAllPages((page, pageSize) => endpoints.listAnnouncements({ active: true, page, pageSize }))
      if (!isCurrent()) throw new Error('announcement request cancelled')
      announcements.value = items
      announcementsLoaded.value = true
    })().finally(() => { announcementPending = null })
    await announcementPending
  }

  async function loadAnnouncements(): Promise<boolean> {
    announcementsLoading.value = true
    announcementsError.value = false
    try {
      await fetchAnnouncements()
      return true
    } catch {
      announcementsError.value = true
      return false
    } finally { announcementsLoading.value = false }
  }

  async function swapAnnouncements(isCurrent: () => boolean = () => true): Promise<void> {
    await fetchAnnouncements(isCurrent)
  }

  async function reload(): Promise<boolean> {
    const [locationsOK, announcementsOK] = await Promise.all([
      reloadLocations(),
      fetchAnnouncements().then(() => true).catch((caught: unknown) => { ui.error(errorMessage(caught, '无法获取公告')); return false })
    ])
    return locationsOK && announcementsOK
  }

  async function ensure(): Promise<boolean> {
    if (pending) return pending
    if (loaded.value) return true
    return reloadLocations()
  }

  const datesWithRoom = computed(() => joinServiceDates(serviceDates.value, rooms.value))

  const announcementList = computed(() =>
    [...announcements.value].sort((a, b) => b.priority - a.priority || b.id - a.id)
  )

  const pinnedAnnouncements = computed(() =>
    announcementList.value.filter((announcement) => announcement.tag === 'pinned')
  )

  const tosContent = computed(
    () => announcementList.value.find((announcement) => announcement.tag === 'tos')?.content ?? ''
  )

  const dateOptions = computed(() => buildDateOptions(datesWithRoom.value))

  return {
    rooms,
    campuses,
    serviceDates,
    announcements,
    loading,
    loaded,
    error,
    announcementsLoading,
    announcementsLoaded,
    announcementsError,
    loadAnnouncements,
    swapAnnouncements,
    swapLocations,
    reload,
    reloadLocations,
    ensure,
    datesWithRoom,
    announcementList,
    pinnedAnnouncements,
    tosContent,
    dateOptions
  }
})
