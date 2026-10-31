<template>
  <div>
    <RecordPreview v-for="record in tickets.finished" :key="record.url" :record="record" />

    <van-list
      v-model:loading="loading"
      v-model:error="error"
      :finished="listFinished"
      :finished-text="tickets.finished.length ? '没有更多了' : ''"
      error-text="加载失败，点击重试"
      @load="onLoad"
    />

    <van-empty
      v-if="listFinished && !tickets.finished.length"
      description="暂无已处理工单"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'

import RecordPreview from '@/components/RecordPreview.vue'
import { useTicketsStore } from '@/stores/tickets'

const tickets = useTicketsStore()
const loading = ref(false)
const error = ref(false)
const listFinished = ref(false)

async function onLoad(): Promise<void> {
  const ok = await tickets.loadFinishedPage(tickets.finishedPage + 1)
  loading.value = false
  error.value = !ok

  if (ok) {
    listFinished.value = !tickets.hasMoreFinished
  }
}

onBeforeMount(() => {
  tickets.resetFinished()
})
</script>
