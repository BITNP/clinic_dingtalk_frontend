<template>
  <div class="weui-panel weui-panel_access">
    <div class="container">
      <div class="container-left">{{ date.room?.name || '' }}</div>
      <div class="container-center"></div>
      <div class="container-right">{{ date.room?.address || '' }}</div>
    </div>

    <div class="weui-panel__bd">
      <div class="vux-card-content">
        <div class="card-flex card-content01">
          <div class="vux-1px-r">
            <span>{{ date.capacity }}</span>
            <br />容量
          </div>
          <div class="vux-1px-r">
            <span>{{ date.count }}</span>
            <br />已预约
          </div>
          <div class="vux-1px-r">
            <span>{{ date.remaining }}</span>
            <br />剩余
          </div>
          <div class="vux-1px-r">
            <span>{{ date.title }}</span>
            <br />状态
          </div>
        </div>
      </div>
    </div>

    <div class="weui-panel__ft"></div>

    <div class="container">
      <div class="container-left">营业时间</div>
      <div class="container-center"></div>
      <div class="container-right">{{ date.startLabel }} - {{ date.endLabel }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ServiceDateWithRoom } from '@/domain/catalog'

defineProps<{
  date: ServiceDateWithRoom
}>()
</script>
