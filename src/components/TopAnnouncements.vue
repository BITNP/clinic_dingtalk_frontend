<template>
  <div>
    <transition name="switch" mode="out-in">
      <div
        v-if="current"
        :key="current.id"
        style="margin: 3px 10px; text-align: center"
      >
        {{ current.brief || current.title }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useCatalogStore } from '@/stores/catalog'

const catalog = useCatalogStore()
const index = ref(0)
let timer: number | undefined

const pinned = computed(() => catalog.pinnedAnnouncements)
const current = computed(() => pinned.value[index.value] ?? pinned.value[0] ?? null)

function stop(): void {
  if (timer !== undefined) {
    window.clearInterval(timer)
    timer = undefined
  }
}

function start(): void {
  stop()
  if (pinned.value.length <= 1) return

  timer = window.setInterval(() => {
    if (pinned.value.length === 0) {
      index.value = 0
      return
    }
    index.value = (index.value + 1) % pinned.value.length
  }, 5000)
}

watch(
  () => pinned.value.length,
  () => {
    index.value = 0
    start()
  }
)

onMounted(start)
onBeforeUnmount(stop)
</script>
