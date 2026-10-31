<template>
  <div>
    <RecordPreview v-if="ticket" :record="ticket" editable @edit="display = true" />

    <van-empty
      v-else-if="tickets.workingLoaded"
      description="当前没有正在处理的工单"
    />

    <div v-else class="loading-state">
      <van-loading vertical>正在加载...</van-loading>
    </div>

    <van-popup
      v-model:show="display"
      position="bottom"
      round
      :style="{ height: '92%' }"
    >
      <PopupContent
        v-if="display && ticket"
        :ticket="ticket"
        @saved="display = false"
        @deleted="onDeleted"
        @cancel="display = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import PopupContent from '@/components/PopupContent.vue'
import RecordPreview from '@/components/RecordPreview.vue'
import { useTicketsStore } from '@/stores/tickets'

const tickets = useTicketsStore()
const router = useRouter()
const display = ref(false)

const ticket = computed(() => tickets.working)

function onDeleted(): void {
  display.value = false
  router.push({ name: 'success', query: { title: '已成功删除工单' } })
}

onMounted(() => {
  void tickets.refreshWorking()
})
</script>

<style scoped>
.loading-state {
  display: flex;
  justify-content: center;
  padding: 64px 0;
}
</style>
