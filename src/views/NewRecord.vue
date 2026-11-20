<template>
  <div>
    <VuxHeader title="新建预约" />
    <RecordForm v-model="draft" :create="true" />
    <br />
    <div style="margin: 10px">
      <VuxButton type="primary" :loading="tickets.submitting" :disabled="tickets.submitting" @click="agree ? submit() : (toc = true)">
        {{ agree ? '提交预约' : '阅读免责声明' }}
      </VuxButton>
      <VuxButton v-if="agree" @click="toc = true">重新查看免责声明</VuxButton>
    </div>

    <TOS v-model="toc" @agree="acceptTos" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import type { TicketDraft } from '@/api/types'
import RecordForm from '@/components/RecordForm.vue'
import TOS from '@/components/TOS.vue'
import VuxButton from '@/components/ui/VuxButton.vue'
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
const acceptedContent = ref('')
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

function acceptTos(content: string): void {
  acceptedContent.value = content
  agree.value = true
}

watch(() => catalog.tosContent, (content) => {
  if (agree.value && content && content.trim() !== acceptedContent.value) agree.value = false
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
