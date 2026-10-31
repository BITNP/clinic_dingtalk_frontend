<template>
  <div>
    <VuxHeader title="新建工单" />
    <RecordForm v-model="draft" :create="true" />
    <br />
    <VuxCheckIcon v-model="agree">
      我已阅读并同意
      <a style="color: blue" @click.stop="toc = true">免责声明</a>
      中的内容
    </VuxCheckIcon>

    <br />
    <div style="margin: 10px">
      <VuxButton type="primary" :loading="tickets.submitting" @click="submit">
        提交
      </VuxButton>
    </div>

    <TOS v-model="toc" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import type { TicketDraft } from '@/api/types'
import RecordForm from '@/components/RecordForm.vue'
import TOS from '@/components/TOS.vue'
import VuxButton from '@/components/ui/VuxButton.vue'
import VuxCheckIcon from '@/components/ui/VuxCheckIcon.vue'
import VuxHeader from '@/components/ui/VuxHeader.vue'
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

onMounted(() => {
  void catalog.ensure()
})
</script>
