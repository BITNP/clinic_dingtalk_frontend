<template>
  <div>
    <div class="vux-popup-header vux-1px-b">
      <div class="vux-popup-header-left"></div>
      <div class="vux-popup-header-title">编辑当前预约</div>
      <div class="vux-popup-header-right"></div>
    </div>

    <div class="weui-panel weui-panel_access">
      <div class="weui-panel__bd">
        <div class="vux-card-content">
          <fieldset :disabled="tickets.submitting" class="form-fields">
            <RecordForm v-model="draft" :create="false" :errors="errors" />
          </fieldset>
          <br />
        </div>
      </div>

      <div class="weui-panel__ft"></div>

      <div style="margin: 10px">
        <VuxButton
          type="primary"
          :loading="tickets.submitting"
          :disabled="tickets.submitting"
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
            <VuxButton type="default" :disabled="tickets.submitting" @click="deleteConfirm = false">返回</VuxButton>
            </div>
            <div class="vux-flexbox-item" style="margin-left: 8px">
            <VuxButton type="warn" :disabled="tickets.submitting" @click="remove">确认取消</VuxButton>
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
import { draftErrors, ticketToDraft } from '@/domain/ticket'
import { useTicketsStore } from '@/stores/tickets'
import { useUiStore } from '@/stores/ui'

const props = defineProps<{
  ticket: Ticket
}>()

const emit = defineEmits<{
  deleted: []
  updated: []
}>()

const tickets = useTicketsStore()
const ui = useUiStore()
const draft = ref(ticketToDraft(props.ticket))
const errors = ref<ReturnType<typeof draftErrors>>({})
const deleteConfirm = ref(false)

async function update(): Promise<void> {
  errors.value = draftErrors(draft.value)
  if (Object.keys(errors.value).length) {
    ui.error('请检查预约信息')
    return
  }

  if (await tickets.updateTicket(props.ticket, draft.value)) emit('updated')
}

async function remove(): Promise<void> {
  const ok = await tickets.deleteTicket(props.ticket)
  if (ok) {
    emit('deleted')
  }
}
</script>

<style scoped>
.form-fields { border: 0; padding: 0; margin: 0; min-width: 0; }
</style>
