<template>
  <div>
    <van-field
      :model-value="selectedLabel"
      label="预约时间"
      placeholder="请选择一个日期"
      readonly
      is-link
      required
      :disabled="disabled"
      @click="open"
    />

    <van-popup v-model:show="show" position="bottom" round>
      <div class="date-picker">
        <div class="date-picker-head">
          <span>选择预约时间</span>
          <van-icon name="cross" @click="show = false" />
        </div>

        <van-empty v-if="!options.length" description="当前校区暂无可预约日期" />

        <van-cell
          v-for="option in options"
          :key="option.date"
          :title="`${option.label} ${option.weekday}`"
          :label="`${option.startLabel} - ${option.endLabel}`"
          clickable
          @click="select(option.date)"
        />
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import type { ServiceDateOption } from '@/domain/catalog'

const props = withDefaults(
  defineProps<{
    options: ServiceDateOption[]
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)

const model = defineModel<string>({ default: '' })
const show = ref(false)

const selectedLabel = computed(() => {
  const option = props.options.find((item) => item.date === model.value)
  if (!option) return ''
  return `${option.label} ${option.weekday}（${option.startLabel} - ${option.endLabel}）`
})

function open(): void {
  if (props.disabled) return
  show.value = true
}

function select(date: string): void {
  model.value = date
  show.value = false
}
</script>

<style scoped>
.date-picker {
  max-height: 70vh;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  overflow-y: auto;
}

.date-picker-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid var(--clinic-border);
}
</style>
