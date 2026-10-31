<template>
  <div class="status-flow">
    <div
      v-for="(step, index) in steps"
      :key="step.title"
      class="status-step"
      :class="{ 'is-done': step.done, 'is-current': step.current }"
    >
      <div class="status-marker">
        <van-icon v-if="step.done" name="success" />
        <span v-else>{{ index + 1 }}</span>
      </div>
      <div class="status-body">
        <div class="status-title">{{ step.title }}</div>
        <div v-if="step.tip" class="status-tip">{{ step.tip }}</div>
      </div>
      <div v-if="index < steps.length - 1" class="status-line" :class="{ 'is-done': step.done }" />
    </div>

    <van-tag v-if="terminal" :type="terminal.type || undefined" size="medium" class="terminal-tag">
      {{ terminal.label }}
    </van-tag>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { TicketStatus } from '@/api/types'
import { buildStatusSteps, terminalInfo } from '@/domain/status'

const props = defineProps<{
  status: TicketStatus
}>()

const steps = computed(() => buildStatusSteps(props.status))
const terminal = computed(() => terminalInfo(props.status))
</script>

<style scoped>
.status-flow {
  padding: 14px 16px;
  margin: 12px;
  background: #fff;
  border-radius: 12px;
}

.status-step {
  position: relative;
  display: flex;
  gap: 12px;
  min-height: 52px;
  color: var(--clinic-muted);
}

.status-marker {
  z-index: 1;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  font-size: 13px;
  font-weight: 600;
  background: #f2f3f5;
  border-radius: 50%;
}

.status-step.is-done .status-marker,
.status-step.is-current .status-marker {
  color: #fff;
  background: var(--clinic-primary);
}

.status-body {
  flex: 1;
  padding-top: 2px;
}

.status-title {
  font-size: 15px;
  font-weight: 500;
}

.status-step.is-done .status-title,
.status-step.is-current .status-title {
  color: var(--clinic-text);
}

.status-tip {
  margin-top: 2px;
  font-size: 12px;
  color: var(--clinic-primary);
}

.status-line {
  position: absolute;
  top: 26px;
  left: 12px;
  width: 2px;
  height: calc(100% - 20px);
  background: #ebedf0;
}

.status-line.is-done {
  background: var(--clinic-primary);
}

.terminal-tag {
  margin-top: 6px;
}
</style>
