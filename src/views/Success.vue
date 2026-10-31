<template>
  <div class="page success-page">
    <van-icon name="checked" size="72" color="#07c160" />

    <h1 class="success-title">{{ title }}</h1>
    <p class="success-description">网络开拓者协会 - 电脑诊所</p>

    <van-button type="primary" block round class="success-button" @click="backHome">
      返回首页
    </van-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

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

<style scoped>
.success-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 28px;
  text-align: center;
}

.success-title {
  margin: 20px 0 8px;
  font-size: 22px;
}

.success-description {
  margin: 0;
  color: var(--clinic-muted);
  font-size: 14px;
}

.success-button {
  margin-top: 40px;
}
</style>
