<template>
  <div>
    <div class="filters" aria-label="预约记录筛选">
      <button v-for="option in filters" :key="option.value" type="button"
        :aria-pressed="filter === option.value" @click="setFilter(option.value)">{{ option.label }}</button>
    </div>
    <RecordPreview v-for="record in displayed" :key="record.url" :record="record" @edit="editing = record" />
    <p v-if="!loading && !error && !displayed.length" class="message">
      {{ hasMore ? '本页暂无符合条件的预约，可继续加载' : '暂无预约记录' }}
    </p>
    <p v-if="error" class="message">{{ error }}</p>
    <div style="margin: 10px">
      <VuxButton v-if="error" @click="loadMore">重试</VuxButton>
      <VuxButton v-else-if="hasMore || loading" :loading="loading" :disabled="loading" @click="loadMore">
        {{ loading ? '正在加载…' : '加载更多' }}
      </VuxButton>
    </div>
    <VuxPopup :show="!!editing" @update:show="(show) => { if (!show) editing = null }">
      <PopupContent v-if="editing" :ticket="editing" @deleted="changed" @updated="changed" />
    </VuxPopup>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { endpoints } from '@/api/endpoints'
import { errorMessage } from '@/api/errors'
import type { Ticket } from '@/api/types'
import PopupContent from '@/components/PopupContent.vue'
import RecordPreview from '@/components/RecordPreview.vue'
import VuxButton from '@/components/ui/VuxButton.vue'
import VuxPopup from '@/components/ui/VuxPopup.vue'
import { isFinishedStatus, isWorkingStatus } from '@/domain/status'
import { useTicketsStore } from '@/stores/tickets'

type Filter = 'all' | 'working' | 'finished'
const filters: { label: string; value: Filter }[] = [
  { label: '全部', value: 'all' }, { label: '未完成', value: 'working' }, { label: '已结束', value: 'finished' }
]
const route = useRoute()
const router = useRouter()
const tickets = useTicketsStore()
const records = ref<Ticket[]>([])
const page = ref(0)
const total = ref(0)
const loading = ref(false)
const error = ref('')
const editing = ref<Ticket | null>(null)
const filter = computed<Filter>(() => route.query.filter === 'working' || route.query.filter === 'finished' ? route.query.filter : 'all')
const displayed = computed(() => records.value.filter((record) => filter.value === 'all' ||
  (filter.value === 'working' ? isWorkingStatus(record.status) : isFinishedStatus(record.status))))
const hasMore = computed(() => page.value === 0 || records.value.length < total.value)
function setFilter(value: Filter): void { void router.replace({ name: 'records', query: value === 'all' ? {} : { filter: value } }) }
async function loadMore(): Promise<void> {
  if (loading.value || !hasMore.value) return
  loading.value = true
  error.value = ''
  try {
    const result = await endpoints.listTickets(page.value + 1)
    const seen = new Set(records.value.map((record) => record.url))
    records.value.push(...result.items.filter((record) => !seen.has(record.url)))
    page.value = result.page
    total.value = result.items.length ? result.total : records.value.length
  } catch (caught) { error.value = errorMessage(caught, '无法获取预约记录') }
  finally { loading.value = false }
}
async function changed(): Promise<void> {
  editing.value = null
  records.value = []
  page.value = 0
  total.value = 0
  await Promise.all([loadMore(), tickets.refreshWorking(true)])
}
watch(() => route.query.filter, () => { editing.value = null })
onMounted(() => { void loadMore() })
</script>

<style scoped>
.filters { display: flex; gap: 8px; margin: 12px; }
.filters button { flex: 1; padding: 8px; background: white; border: 1px solid #ddd; border-radius: 4px; }
.filters button[aria-pressed="true"] { color: #078640; border-color: #078640; }
.message { margin: 16px; color: #666; }
</style>
