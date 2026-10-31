<template>
  <div class="popup-content">
    <van-nav-bar title="编辑当前工单" left-arrow @click-left="emit('cancel')" />

    <div class="popup-body">
      <RecordForm v-model="draft" :create="false" />
    </div>

    <div class="popup-actions">
      <van-button type="primary" block round :loading="tickets.submitting" @click="save">
        更新
      </van-button>
      <van-button
        type="danger"
        block
        round
        plain
        :disabled="tickets.submitting"
        @click="confirmDelete = true"
      >
        删除工单
      </van-button>
    </div>

    <van-dialog
      v-model:show="confirmDelete"
      title="确认删除"
      message="删除后无法恢复，确定要删除这张工单吗？"
      show-cancel-button
      @confirm="remove"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import type { Ticket } from '@/api/types'
import RecordForm from '@/components/RecordForm.vue'
import { validateDraft, ticketToDraft } from '@/domain/ticket'
import { useTicketsStore } from '@/stores/tickets'
import { useUiStore } from '@/stores/ui'

const props = defineProps<{
  ticket: Ticket
}>()

const emit = defineEmits<{
  saved: []
  deleted: []
  cancel: []
}>()

const tickets = useTicketsStore()
const ui = useUiStore()
const draft = ref(ticketToDraft(props.ticket))
const confirmDelete = ref(false)

async function save(): Promise<void> {
  const message = validateDraft(draft.value)
  if (message) {
    ui.error(message)
    return
  }

  const ok = await tickets.updateTicket(props.ticket, draft.value)
  if (ok) {
    emit('saved')
  }
}

async function remove(): Promise<void> {
  const ok = await tickets.deleteTicket(props.ticket)
  if (ok) {
    emit('deleted')
  }
}
</script>

<style scoped>
.popup-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--clinic-bg);
}

.popup-body {
  flex: 1;
  padding: 12px 0;
  overflow-y: auto;
}

.popup-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid var(--clinic-border);
}
</style>
