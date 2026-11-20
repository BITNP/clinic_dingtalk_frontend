<template>
  <div>
    <VuxHeader title="新建预约" />
    <p v-if="initializing">正在确认预约信息…</p>
    <div v-else-if="initializationError" style="margin: 10px">
      <p>{{ initializationError }}</p>
      <VuxButton @click="initialize">重试</VuxButton>
      <VuxButton @click="router.replace({ name: 'calendar' })">返回日历</VuxButton>
    </div>
    <template v-else>
    <RecordForm v-model="draft" :create="true" :campus-id="campusId" />
    <div style="margin: 10px"><VuxButton @click="router.push({ name: 'calendar' })">重新选择日期和校区</VuxButton></div>
    <br />
    <div style="margin: 10px">
      <VuxButton type="primary" :loading="submitting" :disabled="submitting" @click="agree ? submit() : (toc = true)">
        {{ agree ? '提交预约' : '阅读免责声明' }}
      </VuxButton>
      <VuxButton v-if="agree" @click="toc = true">重新查看免责声明</VuxButton>
    </div>

    <TOS v-model="toc" @agree="acceptTos" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { TicketDraft } from '@/api/types'
import RecordForm from '@/components/RecordForm.vue'
import TOS from '@/components/TOS.vue'
import VuxButton from '@/components/ui/VuxButton.vue'
import VuxHeader from '@/components/ui/VuxHeader.vue'
import { validateDraft } from '@/domain/ticket'
import { CLINIC_TIME_ZONE } from '@/domain/format'
import { useCatalogStore } from '@/stores/catalog'
import { useAppointmentDraftStore } from '@/stores/appointmentDraft'
import { useTicketsStore } from '@/stores/tickets'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const route = useRoute()
const catalog = useCatalogStore()
const tickets = useTicketsStore()
const savedDraft = useAppointmentDraftStore()
const ui = useUiStore()

const agree = ref(false)
const acceptedContent = ref('')
const toc = ref(false)
const campusId = ref<number>()
const initializing = ref(true)
const initializationError = ref('')
const submitting = ref(false)
const draft = ref<TicketDraft>(savedDraft.draft ?? {
  campus: '',
  appointment_time: '',
  description: '',
  realname: '',
  phone_num: '',
  model: '',
  password: ''
})
watch(draft, (value) => { savedDraft.draft = { ...value } }, { deep: true })

function acceptTos(content: string): void {
  acceptedContent.value = content
  agree.value = true
}

watch(() => catalog.tosContent, (content) => {
  if (agree.value && content.trim() !== acceptedContent.value) agree.value = false
})

async function initialize(): Promise<void> {
  initializing.value = true
  initializationError.value = ''
  const date = typeof route.query.date === 'string' ? route.query.date : ''
  const campus = Number(route.query.campus)
  const roomId = Number(route.query.room)
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: CLINIC_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today || !Number.isSafeInteger(campus) || campus <= 0 || !Number.isSafeInteger(roomId) || roomId <= 0) {
    await router.replace({ name: 'calendar' })
    return
  }
  const [catalogOK, ticketsOK] = await Promise.all([catalog.reload(), tickets.refreshWorking()])
  if (!catalogOK || !ticketsOK) {
    initializationError.value = '无法确认预约信息，请重试'
    initializing.value = false
    return
  }
  if (tickets.hasWorking) {
    ui.error('已有未完成预约')
    await router.replace({ name: 'calendar' })
    return
  }
  const room = catalog.rooms.find((item) => item.id === roomId && item.campus_id === campus && item.enabled)
  const service = catalog.datesWithRoom.find((item) => item.room_id === roomId && item.dateOnly === date && item.remaining > 0)
  if (!room || !service || !catalog.campuses.some((item) => item.id === campus)) {
    ui.error('预约信息已变化，请重新选择')
    await router.replace({ name: 'calendar' })
    return
  }
  campusId.value = campus
  draft.value = { ...draft.value, campus: room.name, appointment_time: date }
  initializing.value = false
}

async function submit(): Promise<void> {
  if (submitting.value || tickets.submitting) return

  const message = validateDraft(draft.value)
  if (message) {
    ui.error(message)
    return
  }

  if (!agree.value) {
    ui.error('请在提交前先阅读并同意我们的免责声明')
    return
  }

  submitting.value = true
  try {
    if (!await catalog.reload()) return
    const room = catalog.rooms.find((item) => item.name === draft.value.campus && item.campus_id === campusId.value && item.enabled)
    const available = room && catalog.datesWithRoom.some((date) => date.room_id === room.id && date.dateOnly === draft.value.appointment_time && date.remaining > 0)
    if (!available) {
      ui.error('该诊室当前不可预约，请重新选择')
      return
    }
    if (!agree.value || catalog.tosContent.trim() !== acceptedContent.value) {
      agree.value = false
      ui.error('免责声明已更新，请重新阅读')
      return
    }
    const ok = await tickets.createTicket(draft.value)
    if (ok) {
      savedDraft.draft = null
      await router.push({ name: 'success' })
    }
  } finally { submitting.value = false }
}

onMounted(() => {
  void initialize()
})
</script>
