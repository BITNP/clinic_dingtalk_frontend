<template>
  <div>
    <InlineCalendar v-model="value" :disable-date="isDisabled" />
    <br />

    <DatePreview v-for="date in datesSelected" :key="date.id" :date="date" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import DatePreview from '@/components/DatePreview.vue'
import InlineCalendar from '@/components/ui/InlineCalendar.vue'
import { useCatalogStore } from '@/stores/catalog'

const catalog = useCatalogStore()
const value = ref('')

const availableDates = computed(
  () => new Set(catalog.datesWithRoom.map((date) => date.dateOnly))
)

const datesSelected = computed(() =>
  catalog.datesWithRoom.filter((date) => date.dateOnly === value.value)
)

function isDisabled(date: string): boolean {
  return !availableDates.value.has(date)
}

watch(
  () => catalog.dateOptions,
  (options) => {
    if (!options.length) {
      value.value = ''
      return
    }
    if (!options.some((option) => option.date === value.value)) {
      value.value = options[0].date
    }
  },
  { immediate: true }
)

onMounted(() => {
  void catalog.ensure()
})
</script>
