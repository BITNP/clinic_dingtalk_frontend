<template>
  <div>
    <div class="weui-cells__title">必填项</div>
    <div class="weui-cells">
      <SelectorCell
        v-model="campus"
        title="校区"
        :options="campusOptions"
        placeholder="请选择校区"
      />

      <DatePickerCell
        v-model="appointmentTime"
        title="预约时间"
        placeholder="请选择一个日期，可选表示正常营业"
        :readonly="!create"
        :disable-date="isDateDisabled"
      />

      <div v-if="selectedDate" class="weui-cell">
        <div class="weui-cell__bd">
          <p><label class="vux-label">服务时间</label></p>
          <span class="vux-label-desc">请仔细查看诊所日历获取相应信息</span>
        </div>
        <div class="weui-cell__ft">
          {{ selectedDate.startLabel }} - {{ selectedDate.endLabel }}
        </div>
      </div>

      <div class="weui-cell vux-x-textarea">
        <div class="weui-cell__hd">
          <label class="weui-label" :style="{ width: labelWidth('问题描述') }">
            问题描述
          </label>
        </div>
        <div class="weui-cell__bd">
          <textarea
            v-model="description"
            class="weui-textarea"
            rows="3"
            maxlength="600"
            placeholder="请尽可能详细地描述您所遇到的问题"
          ></textarea>
          <div class="weui-textarea-counter">
            <span>{{ description.length }}</span>/600
          </div>
        </div>
      </div>

      <div class="vux-x-input weui-cell">
        <div class="weui-cell__hd">
          <label class="weui-label">真实姓名</label>
        </div>
        <div class="weui-cell__bd weui-cell__primary">
          <input
            v-model="realname"
            class="weui-input"
            style="text-align: right"
            maxlength="50"
          />
        </div>
      </div>

      <div class="vux-x-input weui-cell">
        <div class="weui-cell__hd">
          <label class="weui-label">手机号</label>
        </div>
        <div class="weui-cell__bd weui-cell__primary">
          <input
            v-model="phoneNum"
            class="weui-input"
            style="text-align: right"
            type="tel"
            maxlength="11"
          />
        </div>
      </div>
    </div>

    <div class="weui-cells__title">选填项，这将有助于我们提供更好的服务</div>
    <div class="weui-cells">
      <div class="vux-x-input weui-cell">
        <div class="weui-cell__hd">
          <label class="weui-label">电脑型号</label>
        </div>
        <div class="weui-cell__bd weui-cell__primary">
          <input
            v-model="model"
            class="weui-input"
            style="text-align: right"
            maxlength="200"
          />
        </div>
      </div>

      <div class="vux-x-input weui-cell">
        <div class="weui-cell__hd">
          <label class="weui-label">电脑开机密码</label>
        </div>
        <div class="weui-cell__bd weui-cell__primary">
          <input
            v-model="password"
            class="weui-input"
            style="text-align: right"
            type="password"
            autocomplete="off"
            maxlength="256"
            :placeholder="create ? '帮助我们唤醒休眠的电脑' : '不修改请留空'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'

import type { TicketDraft } from '@/api/types'
import DatePickerCell from '@/components/ui/DatePickerCell.vue'
import SelectorCell, { type SelectorOption } from '@/components/ui/SelectorCell.vue'
import { availableDatesForCampus, findServiceDate } from '@/domain/catalog'
import { useCatalogStore } from '@/stores/catalog'

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

const campusOptions = computed<SelectorOption[]>(() =>
  catalog.rooms.map((room) => ({ label: room.name, value: room.name }))
)

const availableDates = computed(() =>
  availableDatesForCampus(catalog.datesWithRoom, campus.value)
)

const availableDateSet = computed(
  () => new Set(availableDates.value.map((date) => date.dateOnly))
)

const selectedDate = computed(() =>
  findServiceDate(catalog.datesWithRoom, campus.value, appointmentTime.value)
)

function isDateDisabled(date: string): boolean {
  // Keep the current edit value selectable even if the room is now full.
  if (!props.create && date === appointmentTime.value) return false
  return !availableDateSet.value.has(date)
}

function labelWidth(title: string): string {
  let width = 1
  for (const char of title) {
    width += char.charCodeAt(0) > 0xff ? 1 : 0.5
  }
  return width < 10 ? `${width}em` : ''
}

let previousCampus = draft.value.campus
watch(campus, (value) => {
  // Match the original create flow: changing campus invalidates the date.
  // In edit mode the date cell is read-only, so keep the value to avoid a
  // form that cannot be submitted.
  if (props.create && previousCampus && value !== previousCampus) {
    appointmentTime.value = ''
  }
  previousCampus = value
})

onMounted(() => {
  void catalog.ensure()
})
</script>
