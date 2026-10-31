<template>
  <div class="summary-card">
    <div class="summary-head">
      <span class="summary-title">工单详情</span>
      <van-tag :type="tagType || undefined">{{ statusLabel(ticket.status) }}</van-tag>
    </div>

    <div v-for="item in items" :key="item.label" class="summary-row">
      <span class="summary-label">{{ item.label }}</span>
      <span class="summary-value">{{ item.value }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { Ticket } from '@/api/types'
import { statusLabel, statusTagType } from '@/domain/status'
import { buildPreviewItems } from '@/domain/ticket'

const props = defineProps<{
  ticket: Ticket
}>()

const items = computed(() => buildPreviewItems(props.ticket))
const tagType = computed(() => statusTagType(props.ticket.status))
</script>

<style scoped>
.summary-card {
  padding: 14px 16px;
  margin: 12px;
  background: #fff;
  border-radius: 12px;
}

.summary-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--clinic-border);
}

.summary-title {
  font-size: 15px;
  font-weight: 600;
}

.summary-row {
  display: flex;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f6f7;
}

.summary-row:last-child {
  border-bottom: 0;
}

.summary-label {
  flex-shrink: 0;
  width: 84px;
  color: var(--clinic-muted);
  font-size: 13px;
}

.summary-value {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
