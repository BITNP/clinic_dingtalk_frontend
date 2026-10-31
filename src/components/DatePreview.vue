<template>
  <div class="date-card">
    <div class="date-head">
      <div class="campus">{{ date.room?.name || '未知校区' }}</div>
      <div class="address">{{ date.room?.address || '地址待定' }}</div>
    </div>

    <div class="date-grid">
      <div class="date-stat">
        <strong>{{ date.capacity }}</strong>
        <span>容量</span>
      </div>
      <div class="date-stat">
        <strong>{{ date.count }}</strong>
        <span>已预约</span>
      </div>
      <div class="date-stat">
        <strong>{{ date.remaining }}</strong>
        <span>剩余</span>
      </div>
      <div class="date-stat">
        <strong>{{ date.title }}</strong>
        <span>状态</span>
      </div>
    </div>

    <div class="date-foot">
      <van-icon name="clock-o" />
      营业时间 {{ date.startLabel }} - {{ date.endLabel }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ServiceDateWithRoom } from '@/domain/catalog'

defineProps<{
  date: ServiceDateWithRoom
}>()
</script>

<style scoped>
.date-card {
  padding: 14px 16px;
  margin: 12px;
  background: #fff;
  border-radius: 12px;
}

.date-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.campus {
  font-size: 16px;
  font-weight: 600;
}

.address {
  overflow: hidden;
  color: var(--clinic-muted);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date-grid {
  display: flex;
  padding: 16px 0;
  margin-top: 10px;
  border-top: 1px solid var(--clinic-border);
  border-bottom: 1px solid var(--clinic-border);
}

.date-stat {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border-right: 1px solid var(--clinic-border);
}

.date-stat:last-child {
  border-right: 0;
}

.date-stat strong {
  color: var(--clinic-primary);
  font-size: 16px;
}

.date-stat span {
  color: var(--clinic-muted);
  font-size: 12px;
}

.date-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 12px;
  color: var(--clinic-muted);
  font-size: 13px;
}
</style>
