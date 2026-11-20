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

  let pending: Promise<boolean> | null = null
  function reload(): Promise<boolean> {
    if (pending) return pending
    pending = load().finally(() => { pending = null })
    return pending
  }

  async function load(): Promise<boolean> {
    loading.value = true
    error.value = ''

    try {
      const [campusItems, roomItems, dateItems, announcementItems] = await Promise.all([
        fetchAllPages((page, pageSize) => endpoints.listCampuses({ page, pageSize })),
        fetchAllPages((page, pageSize) => endpoints.listRooms({ enabled: true, page, pageSize })),
        fetchAllPages((page, pageSize) =>
          endpoints.listServiceDates({ active: true, page, pageSize })
        ),
        fetchAllPages((page, pageSize) =>
          endpoints.listAnnouncements({ active: true, page, pageSize })
        )
      ])

      campuses.value = campusItems
      rooms.value = roomItems
      serviceDates.value = dateItems
      announcements.value = announcementItems
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

  async function ensure(): Promise<boolean> {
    if (pending) return pending
    if (loaded.value) return true
    return reload()
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
    reload,
    ensure,
    datesWithRoom,
    announcementList,
    pinnedAnnouncements,
    tosContent,
    dateOptions
  }
})
