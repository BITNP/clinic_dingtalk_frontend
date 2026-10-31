<template>
  <div>
    <van-cell-group inset title="必填项">
      <van-field
        :model-value="campus"
        label="校区"
        placeholder="请选择校区"
        readonly
        is-link
        required
        @click="campusPicker = true"
      />

      <ServiceDatePicker v-model="appointmentTime" :options="dateOptions" :disabled="!create" />

      <van-cell
        v-if="selectedDate"
        title="服务时间"
        :value="`${selectedDate.startLabel} - ${selectedDate.endLabel}`"
        label="请仔细查看诊所日历获取相应信息"
      />

      <van-field
        v-model="description"
        label="问题描述"
        type="textarea"
        placeholder="请尽可能详细地描述您所遇到的问题"
        rows="3"
        autosize
        maxlength="600"
        show-word-limit
        required
      />

      <van-field
        v-model="realname"
        label="真实姓名"
        placeholder="请填写真实姓名"
        maxlength="50"
        required
      />

      <van-field
        v-model="phoneNum"
        label="手机号"
        type="tel"
        placeholder="请填写手机号"
        maxlength="11"
        required
      />
    </van-cell-group>

    <van-cell-group inset title="选填项，这将有助于我们提供更好的服务">
      <van-field v-model="model" label="电脑型号" placeholder="例如 ThinkPad X1" maxlength="200" />

      <van-field
        v-model="password"
        label="电脑开机密码"
        type="password"
        autocomplete="off"
        :placeholder="create ? '帮助我们唤醒休眠的电脑' : '不修改请留空'"
        maxlength="256"
      />
    </van-cell-group>

    <van-popup v-model:show="campusPicker" position="bottom" round>
      <div class="campus-picker">
        <div class="campus-picker-head">
          <span>选择校区</span>
          <van-icon name="cross" @click="campusPicker = false" />
        </div>

        <van-empty v-if="!catalog.rooms.length" description="暂无可选校区" />

        <van-cell
          v-for="room in catalog.rooms"
          :key="room.id"
          :title="room.name"
          :label="room.address"
          clickable
          @click="selectCampus(room.name)"
        />
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import type { TicketDraft } from '@/api/types'
import { availableDatesForCampus, findServiceDate } from '@/domain/catalog'
import type { ServiceDateOption, ServiceDateWithRoom } from '@/domain/catalog'
import { formatMonthDay, formatWeekday } from '@/domain/format'
import { useCatalogStore } from '@/stores/catalog'

import ServiceDatePicker from './ServiceDatePicker.vue'

const props = withDefaults(
  defineProps<{
    create?: boolean
  }>(),
  {
    create: true
  }
)

const draft = defineModel<TicketDraft>({ required: true })
const catalog = useCatalogStore()
const campusPicker = ref(false)

const campus = computed({
  get: () => draft.value.campus,
  set: (value: string) => {
    draft.value = { ...draft.value, campus: value }
  }
})

const appointmentTime = computed({
  get: () => draft.value.appointment_time,
  set: (value: string) => {
    draft.value = { ...draft.value, appointment_time: value }
  }
})

const description = computed({
  get: () => draft.value.description,
  set: (value: string) => {
    draft.value = { ...draft.value, description: value }
  }
})

const realname = computed({
  get: () => draft.value.realname,
  set: (value: string) => {
    draft.value = { ...draft.value, realname: value }
  }
})

const phoneNum = computed({
  get: () => draft.value.phone_num,
  set: (value: string) => {
    draft.value = { ...draft.value, phone_num: value }
  }
})

const model = computed({
  get: () => draft.value.model,
  set: (value: string) => {
    draft.value = { ...draft.value, model: value }
  }
})

const password = computed({
  get: () => draft.value.password,
  set: (value: string) => {
    draft.value = { ...draft.value, password: value }
  }
})

const selectedDate = computed(() =>
  findServiceDate(catalog.datesWithRoom, campus.value, appointmentTime.value)
)

const dateOptions = computed<ServiceDateOption[]>(() => {
  const byDate = new Map<string, ServiceDateWithRoom>()

  for (const date of availableDatesForCampus(catalog.datesWithRoom, campus.value)) {
    byDate.set(date.dateOnly, date)
  }

  // Keep the current date visible when editing a booking whose date is no
  // longer selectable (for example because the room filled up).
  if (!props.create && appointmentTime.value && !byDate.has(appointmentTime.value)) {
    const current = catalog.datesWithRoom.find((date) => date.dateOnly === appointmentTime.value)
    if (current) byDate.set(current.dateOnly, current)
  }

  return Array.from(byDate.values())
    .sort((a, b) => a.dateOnly.localeCompare(b.dateOnly))
    .map((date) => ({
      date: date.dateOnly,
      label: formatMonthDay(date.date),
      weekday: formatWeekday(date.date),
      startLabel: date.startLabel,
      endLabel: date.endLabel
    }))
})

function selectCampus(name: string): void {
  if (name !== campus.value) {
    campus.value = name
    appointmentTime.value = ''
  }
  campusPicker.value = false
}

onMounted(() => {
  void catalog.ensure()
})
</script>

<style scoped>
.campus-picker {
  max-height: 70vh;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  overflow-y: auto;
}

.campus-picker-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid var(--clinic-border);
}
</style>
