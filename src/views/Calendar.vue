<template>
  <div>
    <div v-if="catalog.dateOptions.length" class="date-strip">
      <button
        v-for="option in catalog.dateOptions"
        :key="option.date"
        type="button"
        class="date-chip"
        :class="{ 'is-active': selected === option.date }"
        @click="selected = option.date"
      >
        <span class="date-weekday">{{ option.weekday }}</span>
        <span class="date-label">{{ option.label }}</span>
      </button>
    </div>

    <DatePreview v-for="date in datesSelected" :key="date.id" :date="date" />

    <van-empty v-if="!catalog.dateOptions.length && !catalog.loading" description="暂无服务安排" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import DatePreview from '@/components/DatePreview.vue'
import { useCatalogStore } from '@/stores/catalog'

const catalog = useCatalogStore()
const selected = ref('')

const datesSelected = computed(() =>
  catalog.datesWithRoom.filter((date) => date.dateOnly === selected.value)
)

watch(
  () => catalog.dateOptions,
  (options) => {
    if (!options.length) {
      selected.value = ''
      return
    }
    if (!options.some((option) => option.date === selected.value)) {
      selected.value = options[0].date
    }
  },
  { immediate: true }
)

onMounted(() => {
  void catalog.ensure()
})
</script>

<style scoped>
.date-strip {
  display: flex;
  gap: 8px;
  padding: 12px 12px 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.date-strip::-webkit-scrollbar {
  display: none;
}

.date-chip {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 64px;
  padding: 8px 12px;
  color: var(--clinic-text);
  background: #fff;
  border: 1px solid var(--clinic-border);
  border-radius: 12px;
}

.date-chip.is-active {
  color: #fff;
  background: var(--clinic-primary);
  border-color: var(--clinic-primary);
}

.date-weekday {
  font-size: 11px;
  opacity: 0.75;
}

.date-label {
  font-size: 14px;
  font-weight: 600;
}
</style>
