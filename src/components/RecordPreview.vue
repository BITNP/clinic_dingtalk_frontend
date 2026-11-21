<template>
  <div>
    <div v-if="!isTerminal" class="weui-wepay-flow">
      <div class="weui-wepay-flow__bd">
        <div class="weui-wepay-flow__li weui-wepay-flow__li_done">
          <div class="weui-wepay-flow__state">1</div>
          <p class="weui-wepay-flow__title-bottom">创建预约</p>
        </div>

        <div
          class="weui-wepay-flow__line"
          :class="lineClass(line1Done, line1Tip)"
        >
          <div class="weui-wepay-flow__process"></div>
          <div v-if="line1Tip" class="weui-wepay-flow__info-top">{{ line1Tip }}</div>
        </div>

        <div
          class="weui-wepay-flow__li"
          :class="{ 'weui-wepay-flow__li_done': state2Done }"
        >
          <div class="weui-wepay-flow__state">2</div>
          <p class="weui-wepay-flow__title-bottom">审核通过</p>
        </div>

        <div
          class="weui-wepay-flow__line"
          :class="lineClass(line2Done, line2Tip)"
        >
          <div class="weui-wepay-flow__process"></div>
          <div v-if="!line2Done && line2Tip" class="weui-wepay-flow__info-top">
            {{ line2Tip }}
          </div>
        </div>

        <div
          class="weui-wepay-flow__li"
          :class="{ 'weui-wepay-flow__li_done': state3Done }"
        >
          <div class="weui-wepay-flow__state">3</div>
          <p class="weui-wepay-flow__title-bottom">已到诊所</p>
        </div>

        <div
          class="weui-wepay-flow__line"
          :class="lineClass(line3Done, line3Tip)"
        >
          <div class="weui-wepay-flow__process"></div>
          <div v-if="!line3Done && line3Tip" class="weui-wepay-flow__info-top">
            {{ line3Tip }}
          </div>
        </div>

        <div
          class="weui-wepay-flow__li"
          :class="{ 'weui-wepay-flow__li_done': state4Done }"
        >
          <div class="weui-wepay-flow__state">4</div>
          <p class="weui-wepay-flow__title-bottom">完成服务</p>
        </div>
      </div>
    </div>

    <div class="vux-form-preview weui-form-preview">
      <div class="weui-form-preview__hd">
        <label class="weui-form-preview__label">预约状态</label>
        <em class="weui-form-preview__value">{{ statusLabel(record.status) }}</em>
      </div>
      <div class="weui-form-preview__bd">
        <div
          v-for="item in items"
          :key="item.label"
          class="weui-form-preview__item"
        >
          <label class="weui-form-preview__label">{{ item.label }}</label>
          <span class="weui-form-preview__value">{{ item.value }}</span>
        </div>
      </div>
      <div v-if="canEdit" class="weui-form-preview__ft">
        <a
          class="weui-form-preview__btn weui-form-preview__btn_primary"
          href="javascript:;"
          @click="$emit('edit')"
        >
          编辑
        </a>
      </div>
    </div>
    <br />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { Ticket } from '@/api/types'
import { isEditableStatus, statusLabel, terminalInfo } from '@/domain/status'
import { buildPreviewItems } from '@/domain/ticket'

const props = defineProps<{
  record: Ticket
}>()

defineEmits<{
  edit: []
}>()

const status = computed(() => props.record.status)
const items = computed(() => buildPreviewItems(props.record))
const canEdit = computed(() => isEditableStatus(props.record.status))
const isTerminal = computed(() => terminalInfo(status.value) !== null)

const line1Done = computed(() => ['confirmed', 'arrived', 'in_progress', 'completed'].includes(status.value))
const line1Tip = computed(() => status.value === 'pending' ? '正在审核' : '')
const state2Done = computed(() =>
  ['confirmed', 'arrived', 'in_progress', 'completed'].includes(status.value)
)
const line2Done = computed(() =>
  ['arrived', 'in_progress', 'completed'].includes(status.value)
)
const state3Done = computed(() =>
  ['arrived', 'in_progress', 'completed'].includes(status.value)
)
const line3Done = computed(() =>
  status.value === 'completed'
)
const state4Done = computed(() => status.value === 'completed')

const line2Tip = computed(() =>
  status.value === 'confirmed' ? '可以前往诊所' : ''
)
const line3Tip = computed(() => status.value === 'arrived' ? '等待服务' : status.value === 'in_progress' ? '正在服务' : '')

function lineClass(done: boolean, tip: string): Record<string, boolean> {
  return {
    'weui-wepay-flow__line_done': done,
    'weui-wepay-flow__line_ing': !done && Boolean(tip)
  }
}
</script>
