<template>
  <div class="vux-calendar">
    <div
      class="weui-cell"
      :class="{ 'weui-cell_access': !readonly }"
      @click="open"
    >
      <div class="weui-cell__hd">
        <label class="weui-label">{{ title }}</label>
      </div>
      <div class="weui-cell__bd"></div>
      <div class="weui-cell__ft">
        <span v-if="!modelValue" class="vux-cell-placeholder">{{ placeholder }}</span>
        <span v-else class="vux-cell-value">{{ modelValue }}</span>
      </div>
    </div>

    <VuxPopup v-model:show="show">
      <InlineCalendar
        :model-value="modelValue"
        :disable-date="disableDate"
        @update:model-value="onSelect"
      />
    </VuxPopup>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import InlineCalendar from './InlineCalendar.vue'
import VuxPopup from './VuxPopup.vue'

const props = withDefaults(
  defineProps<{
    title: string
    modelValue: string
    placeholder?: string
    readonly?: boolean
    disableDate?: (date: string) => boolean
  }>(),
  {
    placeholder: '',
    readonly: false,
    disableDate: () => false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const show = ref(false)

function open(): void {
  if (props.readonly) return
  show.value = true
}

function onSelect(value: string): void {
  emit('update:modelValue', value)
  show.value = false
}
</script>
