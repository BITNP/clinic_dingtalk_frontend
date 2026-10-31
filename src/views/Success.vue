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

const route = useRoute()
const router = useRouter()
const tickets = useTicketsStore()

const title = computed(() => {
  const value = route.query.title
  return typeof value === 'string' && value.trim() ? value : '已成功提交工单'
})

function backHome(): void {
  router.push({ name: 'home' })
  void tickets.refreshWorking()
}
</script>
