<template>
  <div
    class="vux-selector weui-cell"
    :class="{
      'weui-cell_select': !readonly,
      'weui-cell_select-after': title
    }"
  >
    <div v-if="title" class="weui-cell__hd">
      <label class="weui-label">{{ title }}</label>
    </div>

    <div v-if="!readonly" class="weui-cell__bd">
      <select
        class="weui-select"
        style="direction: rtl"
        :value="modelValue"
        @change="onChange"
      >
        <option v-if="placeholder" value="">{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <div v-else class="weui-cell__ft vux-selector-readonly">
      {{ selectedLabel }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface SelectorOption {
  label: string
  value: string
}

const props = withDefaults(
  defineProps<{
    title?: string
    modelValue: string
    options: SelectorOption[]
    placeholder?: string
    readonly?: boolean
  }>(),
  {
    title: '',
    placeholder: '',
    readonly: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectedLabel = computed(
  () => props.options.find((option) => option.value === props.modelValue)?.label ?? ''
)

function onChange(event: Event): void {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>
