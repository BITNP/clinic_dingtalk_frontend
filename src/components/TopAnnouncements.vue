<template>
  <div
    v-if="current"
    class="top-announcement"
    role="button"
    tabindex="0"
    @click="openAnnouncements"
    @keydown.enter="openAnnouncements"
  >
    <van-icon name="volume-o" />
    <transition name="switch" mode="out-in">
      <span :key="current.id" class="top-announcement-text">
        {{ current.brief || current.title }}
      </span>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useCatalogStore } from '@/stores/catalog'

const catalog = useCatalogStore()
const router = useRouter()

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

function openAnnouncements(): void {
  router.push({ name: 'announcements' })
}
</script>

<style scoped>
.top-announcement {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  margin: 10px 12px 2px;
  overflow: hidden;
  color: #8a5a00;
  font-size: 13px;
  background: #fff7e8;
  border-radius: 999px;
}

.top-announcement-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.switch-enter-active,
.switch-leave-active {
  transition: all 0.4s ease;
}

.switch-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.switch-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
