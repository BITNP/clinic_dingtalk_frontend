<template>
  <div id="app">
    <template v-if="session.ready">
      <router-view />
    </template>

    <div v-else-if="session.state === 'error'" class="boot-state">
      <van-empty image="error" :description="session.error || '登录失败，请重试'" />
      <van-button type="primary" round @click="retry">重新登录</van-button>
    </div>

    <div v-else class="boot-state">
      <van-loading size="28" vertical>正在登录...</van-loading>
    </div>

    <van-toast
      v-model:show="ui.toast.show"
      :message="ui.toast.text"
      :position="ui.toast.position"
    />

    <van-overlay :show="ui.loading" class="loading-overlay">
      <div class="loading-wrap">
        <van-loading vertical>正在加载...</van-loading>
      </div>
    </van-overlay>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { useCatalogStore } from '@/stores/catalog'
import { useSessionStore } from '@/stores/session'
import { useTicketsStore } from '@/stores/tickets'
import { useUiStore } from '@/stores/ui'

const session = useSessionStore()
const catalog = useCatalogStore()
const tickets = useTicketsStore()
const ui = useUiStore()

async function boot(): Promise<void> {
  const ok = await session.ensure()
  if (!ok) return
  await Promise.allSettled([catalog.ensure(), tickets.refreshWorking()])
}

async function retry(): Promise<void> {
  await boot()
}

onMounted(boot)
</script>

<style scoped>
.boot-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  gap: 16px;
}

.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-wrap {
  padding: 20px 28px;
  background: rgba(0, 0, 0, 0.72);
  border-radius: 12px;
}
</style>
