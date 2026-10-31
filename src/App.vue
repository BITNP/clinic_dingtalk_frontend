<template>
  <div id="app">
    <template v-if="session.ready">
      <router-view />
    </template>

    <div v-else-if="session.state === 'error'" class="weui-msg login-error">
      <div class="weui-msg__icon-area">
        <i class="weui-icon_msg weui-icon-warn"></i>
      </div>
      <div class="weui-msg__text-area">
        <h2 class="weui-msg__title">登录失败</h2>
        <p class="weui-msg__desc">{{ session.error }}</p>
      </div>
      <div class="weui-msg__opr-area">
        <p class="weui-btn-area">
          <VuxButton type="primary" @click="retry">重新登录</VuxButton>
        </p>
      </div>
    </div>

    <div v-else class="weui-loading_toast vux-loading">
      <div class="weui-mask_transparent"></div>
      <div class="weui-toast">
        <i class="weui-loading weui-icon_toast"></i>
        <p class="weui-toast__content">正在登录...</p>
      </div>
    </div>

    <VuxToast
      :show="ui.toast.show"
      :text="ui.toast.text"
      :position="ui.toast.position"
      mask
    />
    <VuxLoading :show="ui.loading" text="正在努力加载" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import VuxButton from '@/components/ui/VuxButton.vue'
import VuxLoading from '@/components/ui/VuxLoading.vue'
import VuxToast from '@/components/ui/VuxToast.vue'
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
