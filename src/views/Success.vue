<template>
  <div>
    <br />
    <br />
    <br />
    <div class="weui-msg">
      <div class="weui-msg__icon-area">
        <i class="weui-icon_msg weui-icon-success"></i>
      </div>
      <div class="weui-msg__text-area">
        <h2 class="weui-msg__title">{{ title }}</h2>
        <p class="weui-msg__desc">网络开拓者协会 - 电脑诊所</p>
        <div v-if="showSummary" class="summary">
          <p>预约日期：{{ tickets.lastCreated?.appointment_time }}</p>
          <p>校区：{{ campusName }}</p>
          <p>诊室：{{ tickets.lastCreated?.campus }}</p>
          <p>服务时间：{{ serviceTime }}</p>
          <p>地址：{{ room?.address || '暂无地址信息' }}</p>
        </div>
      </div>
      <div class="weui-msg__opr-area">
        <p class="weui-btn-area">
          <VuxButton type="primary" @click="backHome">返回首页</VuxButton>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import VuxButton from '@/components/ui/VuxButton.vue'
import { useTicketsStore } from '@/stores/tickets'
import { useCatalogStore } from '@/stores/catalog'

const route = useRoute()
const router = useRouter()
const tickets = useTicketsStore()
const catalog = useCatalogStore()

const title = computed(() => {
  const value = route.query.title
  return typeof value === 'string' && value.trim() ? value : '已成功提交预约'
})
const showSummary = computed(() => !route.query.title && !!tickets.lastCreated)
const room = computed(() => catalog.rooms.find((item) => item.name === tickets.lastCreated?.campus))
const campusName = computed(() => catalog.campuses.find((item) => item.id === room.value?.campus_id)?.name || '暂无校区信息')
const serviceTime = computed(() => {
  const date = catalog.datesWithRoom.find((item) => item.room_id === room.value?.id && item.dateOnly === tickets.lastCreated?.appointment_time)
  return date ? `${date.startLabel} - ${date.endLabel}` : '暂无服务时间信息'
})

function backHome(): void {
  router.push({ name: 'home' })
  void tickets.refreshWorking()
}
</script>

<style scoped>
.summary { text-align: left; margin: 20px auto; max-width: 360px; padding: 12px; line-height: 1.8; background: #f7f7f7; }
</style>
