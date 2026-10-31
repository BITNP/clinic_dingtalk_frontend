<template>
  <div v-if="ticket">
    <RecordPreview :record="ticket" @edit="display = true" />

    <VuxPopup v-model:show="display">
      <PopupContent
        v-if="display"
        :ticket="ticket"
        @deleted="onDeleted"
      />
    </VuxPopup>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import PopupContent from '@/components/PopupContent.vue'
import RecordPreview from '@/components/RecordPreview.vue'
import VuxPopup from '@/components/ui/VuxPopup.vue'
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
