<template>
  <div class="page">
    <van-nav-bar title="新建工单" left-arrow @click-left="goHome" />

    <div class="form-page">
      <RecordForm v-model="draft" :create="true" />

      <div class="agreement">
        <van-checkbox v-model="agree" icon-size="18px">
          我已阅读并同意
          <a @click.stop="toc = true">免责声明</a>
          中的内容
        </van-checkbox>
      </div>

      <div class="submit-bar">
        <van-button
          type="primary"
          block
          round
          :loading="tickets.submitting"
          :disabled="tickets.submitting"
          @click="submit"
        >
          提交
        </van-button>
      </div>

      <TOS v-model:show="toc" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import type { TicketDraft } from '@/api/types'
import RecordForm from '@/components/RecordForm.vue'
import TOS from '@/components/TOS.vue'
import { validateDraft } from '@/domain/ticket'
import { useCatalogStore } from '@/stores/catalog'
import { useTicketsStore } from '@/stores/tickets'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const catalog = useCatalogStore()
const tickets = useTicketsStore()
const ui = useUiStore()

const agree = ref(false)
const toc = ref(false)

const draft = ref<TicketDraft>({
  campus: '',
  appointment_time: '',
  description: '',
  realname: '',
  phone_num: '',
  model: '',
  password: ''
})

watch(
  () => catalog.rooms,
  (rooms) => {
    if (!draft.value.campus && rooms.length > 0) {
      draft.value = { ...draft.value, campus: rooms[0].name }
    }
  },
  { immediate: true }
)

async function submit(): Promise<void> {
  if (tickets.submitting) return

  const message = validateDraft(draft.value)
  if (message) {
    ui.error(message)
    return
  }

  if (!agree.value) {
    ui.error('请在提交前先阅读并同意我们的免责声明')
    return
  }

  const ok = await tickets.createTicket(draft.value)
  if (ok) {
    router.push({ name: 'success' })
  }
}

function goHome(): void {
  router.push({ name: 'home' })
}

onMounted(() => {
  void catalog.ensure()
})
</script>

<style scoped>
.form-page {
  padding: 12px 0 calc(24px + env(safe-area-inset-bottom));
}

.agreement {
  padding: 16px;
  font-size: 13px;
}

.submit-bar {
  padding: 8px 16px;
}
</style>
