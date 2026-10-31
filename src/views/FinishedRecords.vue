<template>
  <div>
    <RecordPreview
      v-for="record in tickets.finished"
      :key="record.url"
      :record="record"
    />

    <div ref="sentinel" class="infinite-sentinel"></div>

    <div v-if="loading" class="infinite-loading">
      <i class="weui-loading"></i> 加载中
    </div>
    <div v-else-if="error" class="infinite-loading" @click="loadMore">
      加载失败，点击重试
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import RecordPreview from '@/components/RecordPreview.vue'
import { useTicketsStore } from '@/stores/tickets'

const tickets = useTicketsStore()
const sentinel = ref<HTMLElement | null>(null)
const loading = ref(false)
const error = ref(false)

let observer: IntersectionObserver | undefined

async function loadMore(): Promise<void> {
  if (loading.value) return
  // The store starts with total=0, so allow the first page explicitly.
  if (tickets.finishedPage > 0 && !tickets.hasMoreFinished) return
  loading.value = true
  error.value = false

  const ok = await tickets.loadFinishedPage(tickets.finishedPage + 1)
  loading.value = false
  error.value = !ok
}

onMounted(() => {
  tickets.resetFinished()
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        void loadMore()
      }
    },
    { rootMargin: '200px' }
  )
  if (sentinel.value) observer.observe(sentinel.value)
  void loadMore()
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>
