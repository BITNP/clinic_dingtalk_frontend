<template>
  <div>
    <InlineCalendar v-model="day" :disable-date="isDisabled" />
    <p v-if="catalog.loading">正在加载服务日历…</p>
    <div v-else-if="catalog.error" style="margin: 10px">
      <p>无法获取服务日历，请重试</p>
      <VuxButton @click="catalog.reloadLocations()">重试</VuxButton>
    </div>
    <template v-else-if="day">
      <div class="weui-cells__title">请选择校区</div>
      <div class="weui-cells">
        <button v-for="item in campusOptions" :key="item.campus.id" type="button" class="campus-option"
          :class="{ selected: campusId === item.campus.id }" @click="campusId = item.campus.id">
          <span>{{ item.campus.name }}</span>
          <span>已预约 {{ item.count }}/{{ item.capacity }}，剩余 {{ item.remaining }}</span>
        </button>
      </div>
      <DatePreview v-for="date in selected?.services" :key="date.id" :date="date" />
    </template>
    <div style="margin: 10px">
      <p v-if="selectionError">{{ selectionError }}</p>
      <VuxButton v-if="!tickets.workingLoaded && !tickets.workingLoading" @click="tickets.refreshWorking()">重试获取预约状态</VuxButton>
      <VuxButton type="primary" :disabled="buttonDisabled" :loading="selecting" @click="next">
        {{ buttonText }}
      </VuxButton>
      <VuxButton v-if="selectionError" @click="next">重试</VuxButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { endpoints } from '@/api/endpoints'
import DatePreview from '@/components/DatePreview.vue'
import InlineCalendar from '@/components/ui/InlineCalendar.vue'
import VuxButton from '@/components/ui/VuxButton.vue'
import { campusDates } from '@/domain/catalog'
import { CLINIC_TIME_ZONE, formatDateOnly } from '@/domain/format'
import { useCatalogStore } from '@/stores/catalog'
import { useTicketsStore } from '@/stores/tickets'

const router = useRouter()
const catalog = useCatalogStore()
const tickets = useTicketsStore()
const day = ref('')
const campusId = ref<number | null>(null)
const selecting = ref(false)
const selectionError = ref('')
let selectionVersion = 0
const today = () => formatDateOnly(new Intl.DateTimeFormat('en-CA', { timeZone: CLINIC_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()))
const validDates = computed(() => new Set(catalog.datesWithRoom.filter((date) =>
  date.room?.enabled && catalog.campuses.some((campus) => campus.id === date.room?.campus_id) && date.dateOnly >= today()
).map((date) => date.dateOnly)))
const campusOptions = computed(() => campusDates(catalog.datesWithRoom, catalog.campuses, day.value))
const selected = computed(() => campusOptions.value.find((item) => item.campus.id === campusId.value))
const buttonText = computed(() => {
  if (selecting.value) return '正在获取诊室…'
  if (tickets.createUncertain) return '请先确认预约状态'
  if (selectionError.value) return '获取诊室失败'
  if (day.value && campusId.value !== null && !selected.value) return '该校区当天无服务'
  if (!day.value || !selected.value) return '请选择日期和校区'
  if (!selected.value.remaining) return '该校区已约满'
  if (!tickets.workingLoaded || tickets.workingLoading) return '正在获取预约状态…'
  if (tickets.hasWorking) return '已有未完成预约'
  return '下一步'
})
const buttonDisabled = computed(() => tickets.createUncertain || selecting.value || !!selectionError.value || catalog.loading || !!catalog.error || !day.value || !selected.value || !selected.value.remaining || !tickets.workingLoaded || tickets.workingLoading || tickets.hasWorking)
function isDisabled(date: string): boolean { return !validDates.value.has(date) }
watch([day, campusId], () => { selectionVersion++; selectionError.value = '' })
watch(day, () => {
  if (!campusOptions.value.some((item) => item.campus.id === campusId.value)) campusId.value = null
})
async function next(): Promise<void> {
  if (tickets.createUncertain || selecting.value || !day.value || !selected.value || !selected.value.remaining || tickets.hasWorking || !tickets.workingLoaded) return
  selectionError.value = ''
  selecting.value = true
  const version = selectionVersion
  const date = day.value
  const id = campusId.value!
  try {
    if (!await catalog.reloadLocations()) throw new Error('无法刷新服务日期')
    if (version !== selectionVersion) return
    const response = await endpoints.recommendRoom(id, date)
    if (version !== selectionVersion) return
    if (response.preferred_room_id === null) {
      await catalog.reloadLocations()
      if (version === selectionVersion) selectionError.value = '该校区当前没有可预约诊室，请重新选择'
      return
    }
    const room = catalog.rooms.find((item) => item.id === response.preferred_room_id) ?? await endpoints.getRoom(response.preferred_room_id)
    if (version !== selectionVersion) return
    const service = catalog.datesWithRoom.find((item) => item.room_id === room.id && item.dateOnly === date && item.remaining > 0)
    if (!room.enabled || room.campus_id !== id || !service) throw new Error('诊室信息已变化')
    await router.push({ name: 'record', query: { date, campus: String(id), room: String(room.id) } })
  } catch {
    if (version === selectionVersion) selectionError.value = '获取诊室失败，请重试'
  } finally { selecting.value = false }
}
onMounted(() => { void catalog.ensure() })
</script>

<style scoped>
.campus-option { display: flex; justify-content: space-between; gap: 12px; width: 100%; padding: 14px; border: 0; border-bottom: 1px solid #eee; background: white; text-align: left; }
.campus-option.selected { color: #078640; background: #eaf8ef; }
</style>
