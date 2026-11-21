<template>
  <div>
    <RecordPreview v-for="record in records" :key="record.url" :record="record" @edit="editing = record" />
    <p v-if="!loading && !error && !records.length" class="message">
      {{ hasMore ? '本页暂无符合条件的预约，可继续加载' : '暂无预约记录' }}
    </p>
    <p v-if="error" class="message">{{ error }}</p>
    <div style="margin: 10px">
      <VuxButton v-if="error" @click="loadMore">重试</VuxButton>
      <VuxButton v-else-if="hasMore || loading" :loading="loading" :disabled="loading" @click="loadMore">
        {{ loading ? '正在加载…' : '加载更多' }}
      </VuxButton>
    </div>
    <VuxPopup :show="!!editing" :hide-on-blur="!tickets.submitting" @update:show="(show) => { if (!show && !tickets.submitting) editing = null }">
      <PopupContent v-if="editing" :ticket="editing" @deleted="changed" @updated="changed" />
    </VuxPopup>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { endpoints } from '@/api/endpoints'
import { errorMessage } from '@/api/errors'
import type { Ticket } from '@/api/types'
import PopupContent from '@/components/PopupContent.vue'
import RecordPreview from '@/components/RecordPreview.vue'
import VuxButton from '@/components/ui/VuxButton.vue'
import VuxPopup from '@/components/ui/VuxPopup.vue'
import { useTicketsStore } from '@/stores/tickets'

const tickets = useTicketsStore()
const records = ref<Ticket[]>([])
const page = ref(0)
const total = ref(0)
const loading = ref(false)
const error = ref('')
const editing = ref<Ticket | null>(null)
let generation = 0
onBeforeRouteLeave(() => !tickets.submitting)
const hasMore = computed(() => page.value === 0 || records.value.length < total.value)
async function loadMore(): Promise<void> {
  if (loading.value || !hasMore.value) return
  loading.value = true
  error.value = ''
  const request = generation
  try {
    const result = await endpoints.listTickets(page.value + 1)
    if (request !== generation) return
    const seen = new Set(records.value.map((record) => record.url))
    records.value.push(...result.items.filter((record) => !seen.has(record.url)))
    page.value = result.page
    total.value = result.items.length ? result.total : records.value.length
  } catch (caught) { if (request === generation) error.value = errorMessage(caught, '无法获取预约记录') }
  finally { if (request === generation) loading.value = false }
}
async function changed(): Promise<void> {
  editing.value = null
  generation++
  loading.value = false
  records.value = []
  page.value = 0
  total.value = 0
  await Promise.all([loadMore(), tickets.refreshWorking(true)])
}
onMounted(() => { void loadMore() })
</script>

<style scoped>
.message { margin: 16px; color: #666; }
</style>
