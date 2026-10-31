<template>
  <div class="record-preview">
    <div class="record-head">
      <div>
        <div class="record-title">工单 #{{ formatTicketNo(record.url) }}</div>
        <div class="record-sub">
          {{ record.campus }} · {{ formatDateOnly(record.appointment_time) }}
        </div>
      </div>
      <van-tag :type="tagType || undefined">{{ statusLabel(record.status) }}</van-tag>
    </div>

    <StatusFlow :status="record.status" />
    <TicketSummary :ticket="record" />

    <div v-if="editable && canEdit" class="record-actions">
      <van-button size="small" type="primary" plain @click="$emit('edit')">编辑</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { Ticket } from '@/api/types'
import { formatDateOnly } from '@/domain/format'
import { isEditableStatus, statusLabel, statusTagType } from '@/domain/status'
import { formatTicketNo } from '@/domain/ticket'

import StatusFlow from './StatusFlow.vue'
import TicketSummary from './TicketSummary.vue'

const props = withDefaults(
  defineProps<{
    record: Ticket
    editable?: boolean
  }>(),
  {
    editable: false
  }
)

defineEmits<{
  edit: []
}>()

const tagType = computed(() => statusTagType(props.record.status))
const canEdit = computed(() => isEditableStatus(props.record.status))
</script>

<style scoped>
.record-preview {
  margin-bottom: 12px;
}

.record-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 16px 0;
}

.record-title {
  font-size: 16px;
  font-weight: 600;
}

.record-sub {
  margin-top: 4px;
  color: var(--clinic-muted);
  font-size: 12px;
}

.record-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 16px 14px;
}
</style>
