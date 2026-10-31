<template>
  <div>
    <div class="vux-popup-header vux-1px-b">
      <div class="vux-popup-header-left"></div>
      <div class="vux-popup-header-title">编辑当前工单</div>
      <div class="vux-popup-header-right"></div>
    </div>

    <div class="weui-panel weui-panel_access">
      <div class="weui-panel__bd">
        <div class="vux-card-content">
          <RecordForm v-model="draft" :create="false" />
          <br />
        </div>
      </div>

      <div class="weui-panel__ft"></div>

      <div style="margin: 10px">
        <VuxButton
          type="primary"
          :loading="tickets.submitting"
          @click="update"
        >
          更新
        </VuxButton>

        <template v-if="!deleteConfirm">
          <VuxButton
            type="warn"
            :disabled="tickets.submitting"
            @click="deleteConfirm = true"
          >
            删除
          </VuxButton>
        </template>
        <template v-else>
          <br />
          <div class="vux-flexbox">
            <div class="vux-flexbox-item">
              <VuxButton type="default" @click="deleteConfirm = false">取消</VuxButton>
            </div>
            <div class="vux-flexbox-item" style="margin-left: 8px">
              <VuxButton type="warn" @click="remove">确认删除</VuxButton>
            </div>
          </div>
        </template>

        <br />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import type { Ticket } from '@/api/types'
import RecordForm from '@/components/RecordForm.vue'
import VuxButton from '@/components/ui/VuxButton.vue'
import { ticketToDraft, validateDraft } from '@/domain/ticket'
import { useTicketsStore } from '@/stores/tickets'
import { useUiStore } from '@/stores/ui'

const props = defineProps<{
  ticket: Ticket
}>()

const emit = defineEmits<{
  deleted: []
}>()

const tickets = useTicketsStore()
const ui = useUiStore()
const draft = ref(ticketToDraft(props.ticket))
const deleteConfirm = ref(false)

async function update(): Promise<void> {
  const message = validateDraft(draft.value)
  if (message) {
    ui.error(message)
    return
  }

  await tickets.updateTicket(props.ticket, draft.value)
}

async function remove(): Promise<void> {
  const ok = await tickets.deleteTicket(props.ticket)
  if (ok) {
    emit('deleted')
  }
}
</script>
