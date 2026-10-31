<template>
  <div class="page">
    <div class="page-header">
      <van-tabs :active="tabNum" shrink @change="onTabChange">
        <van-tab v-for="tab in tabs" :key="tab.name" :title="tab.title" />
      </van-tabs>
    </div>

    <div class="page-content main-content">
      <TopAnnouncements />
      <router-view />
      <Footer />
    </div>

    <div v-if="showNewButton" class="page-footer">
      <van-button type="primary" block round @click="goNew">新建工单</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Footer from '@/components/Footer.vue'
import TopAnnouncements from '@/components/TopAnnouncements.vue'
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

function onTabChange(name: number | string): void {
  const index = typeof name === 'number' ? name : tabs.findIndex((tab) => tab.title === name)
  if (index < 0 || index === tabNum.value) return
  router.push({ name: tabs[index].name })
}

function goNew(): void {
  router.push({ name: 'record' })
}
</script>

<style scoped>
.page-header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 10;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.main-content {
  padding-top: 52px;
}
</style>
