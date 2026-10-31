<template>
  <div class="page">
    <div class="page-header">
      <div class="vux-tab-wrap">
        <div class="vux-tab-container">
          <div class="vux-tab">
            <div
              v-for="(tab, index) in tabs"
              :key="tab.name"
              class="vux-tab-item"
              :class="{ 'vux-tab-selected': index === tabNum }"
              @click="switchTab(index)"
            >
              {{ tab.title }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="tab-spacer"></div>

    <div class="page-content">
      <TopAnnouncements />
      <router-view />
      <Footer />
    </div>

    <div v-if="showNewButton" class="page-footer">
      <div style="margin: 10px">
        <VuxButton type="primary" @click="goNew">新建工单</VuxButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Footer from '@/components/Footer.vue'
import TopAnnouncements from '@/components/TopAnnouncements.vue'
import VuxButton from '@/components/ui/VuxButton.vue'
import { useTicketsStore } from '@/stores/tickets'

interface TabItem {
  title: string
  name: 'announcements' | 'calendar' | 'working' | 'finish'
}

const tabs: TabItem[] = [
  { title: '公告', name: 'announcements' },
  { title: '诊所服务日历', name: 'calendar' },
  { title: '正在处理', name: 'working' },
  { title: '已处理', name: 'finish' }
]

const route = useRoute()
const router = useRouter()
const tickets = useTicketsStore()

const tabNum = computed(() => {
  const index = tabs.findIndex((tab) => tab.name === route.name)
  return index >= 0 ? index : 0
})

const showNewButton = computed(() => tickets.workingLoaded && !tickets.hasWorking)

function switchTab(index: number): void {
  if (index === tabNum.value) return
  router.push({ name: tabs[index].name })
}

function goNew(): void {
  router.push({ name: 'record' })
}
</script>

<style scoped>
.tab-spacer {
  height: 44px;
}
</style>
