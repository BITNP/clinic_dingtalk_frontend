<template>
  <VuxPopup v-model:show="show" height="100%">
    <div class="popup">
      <div id="toc">
        <p v-if="loading">正在加载免责声明…</p>
        <template v-else-if="error">
          <p>{{ error }}</p>
          <VuxButton @click="load">重试</VuxButton>
        </template>
        <MarkdownContent v-else :source="content" />
      </div>
      <br />
      <VuxButton type="primary" :disabled="loading || !!error || remaining > 0" @click="agree">
        {{ remaining > 0 ? `同意并继续（${remaining}s）` : '同意并继续' }}
      </VuxButton>
      <VuxButton @click="show = false">返回</VuxButton>
    </div>
  </VuxPopup>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { endpoints } from '@/api/endpoints'
import { fetchAllPages } from '@/api/pagination'
import MarkdownContent from '@/components/MarkdownContent.vue'
import VuxButton from '@/components/ui/VuxButton.vue'
import VuxPopup from '@/components/ui/VuxPopup.vue'

const show = defineModel<boolean>({ default: false })
const emit = defineEmits<{ agree: [content: string] }>()
const content = ref('')
const loading = ref(false)
const error = ref('')
const remaining = ref(5)
let elapsed = 0
let startedAt: number | null = null
let timer: ReturnType<typeof setInterval> | null = null
let generation = 0

function updateClock(): void {
  const total = elapsed + (startedAt === null ? 0 : performance.now() - startedAt)
  remaining.value = Math.max(0, Math.ceil((5000 - total) / 1000))
}

function visibilityChanged(): void {
  if (startedAt !== null) elapsed += performance.now() - startedAt
  startedAt = show.value && !document.hidden && !loading.value && !error.value ? performance.now() : null
  updateClock()
}

function stop(): void {
  generation++
  if (timer !== null) clearInterval(timer)
  timer = null
  startedAt = null
  document.removeEventListener('visibilitychange', visibilityChanged)
}

async function load(): Promise<void> {
  stop()
  const request = generation
  content.value = ''
  error.value = ''
  remaining.value = 5
  elapsed = 0
  loading.value = true
  try {
    const announcements = await fetchAllPages((page, pageSize) =>
      endpoints.listAnnouncements({ active: true, tag: 'tos', page, pageSize })
    )
    if (request !== generation || !show.value) return
    const text = announcements.sort((a, b) => b.priority - a.priority || b.id - a.id)[0]?.content.trim()
    if (!text) throw new Error('暂无有效免责声明')
    content.value = text
    loading.value = false
    await nextTick()
    if (request !== generation || !show.value) return
    document.addEventListener('visibilitychange', visibilityChanged)
    visibilityChanged()
    timer = setInterval(updateClock, 100)
  } catch {
    if (request === generation && show.value) error.value = '免责声明加载失败，请重试'
  } finally {
    if (request === generation) loading.value = false
  }
}

function agree(): void {
  updateClock()
  if (loading.value || error.value || !content.value || remaining.value > 0) return
  emit('agree', content.value)
  show.value = false
}

watch(show, (visible) => { if (visible) void load(); else stop() }, { immediate: true })
onBeforeUnmount(stop)
</script>
