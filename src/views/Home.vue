<template>
  <div>
    <div class="weui-panel weui-panel_access">
      <div class="weui-panel__hd">公告</div>
      <div class="weui-panel__bd">
        <p v-if="catalog.announcementsLoading && !catalog.announcementsLoaded" class="home-message">正在加载公告…</p>
        <div v-else-if="catalog.announcementsError && !catalog.announcementsLoaded" class="home-message">
          <p>公告加载失败，请重试</p>
          <VuxButton @click="loadAnnouncements">重试</VuxButton>
        </div>
        <p v-else-if="!orderedAnnouncements.length" class="home-message">暂无公告</p>
        <div
          v-for="item in orderedAnnouncements"
          :key="item.id"
          class="weui-media-box weui-media-box_text"
          @click="clickItem(item, $event)"
        >
          <h4 class="weui-media-box__title"><MarkdownContent :source="item.title" inline /></h4>
          <div class="weui-media-box__desc">
            <span>[{{ tagLabel(item.tag) }}]</span>
            <MarkdownContent :source="item.brief" />
          </div>
        </div>
      </div>
      <div class="weui-panel__ft"></div>
    </div>

    <br />

    <div class="weui-panel weui-panel_access">
      <div class="weui-panel__hd">当前预约</div>
      <div class="home-message">
        <p v-if="tickets.workingLoading">正在加载预约…</p>
        <template v-else-if="!tickets.workingLoaded">
          <p>预约状态加载失败，请重试</p>
          <VuxButton @click="tickets.refreshWorking()">重试</VuxButton>
        </template>
        <template v-else-if="tickets.working">
          <p>预约单号：{{ formatTicketNo(tickets.working.url) }}</p>
          <p>状态：{{ statusLabel(tickets.working.status) }}</p>
          <p>预约日期：{{ tickets.working.appointment_time }}</p>
          <p>服务时间：{{ serviceTime }}</p>
          <p>校区：{{ campusName }}</p>
          <p>诊室：{{ tickets.working.campus }}</p>
          <p>地址：{{ room?.address || '暂无地址信息' }}</p>
          <VuxButton type="primary" @click="viewWorking">查看当前预约</VuxButton>
        </template>
        <template v-else-if="tickets.createUncertain">
          <p>上次提交结果尚未确认，请重新查询预约状态。若暂未查到，请稍后再确认，避免重复预约。</p>
          <VuxButton type="primary" @click="tickets.checkUncertainCreate()">重新查询预约状态</VuxButton>
          <template v-if="tickets.uncertainChecked">
            <p>暂未查到预约，之前的请求仍可能处理中。请稍后再次查询。</p>
            <VuxButton @click="tickets.createUncertain = false">我已确认，重新预约</VuxButton>
          </template>
        </template>
        <template v-else>
          <p>暂无未完成预约</p>
          <VuxButton type="primary" @click="router.push({ name: 'calendar' })">新建预约</VuxButton>
        </template>
      </div>
    </div>

    <VuxPopup v-model:show="showpopup" position="right" width="100%">
      <div v-if="selected" class="announcement-dialog">
        <div class="announcement-dialog__content">
          <div class="weui-cells vux-no-group-title">
            <div class="weui-cell cell-grey">
              <div class="weui-cell__bd">
                <p><label class="vux-label">标题</label></p>
              </div>
              <div class="weui-cell__ft"><MarkdownContent :source="selected.title" inline /></div>
            </div>
            <div class="weui-cell cell-grey">
              <div class="weui-cell__bd">
                <p><label class="vux-label">公告类型</label></p>
              </div>
              <div class="weui-cell__ft">{{ tagLabel(selected.tag) }}</div>
            </div>
            <div class="weui-cell cell-grey">
              <div class="weui-cell__bd">
                <p><label class="vux-label">最后修改时间</label></p>
              </div>
              <div class="weui-cell__ft">{{ formatDateTime(selected.lastEditedTime) }}</div>
            </div>
          </div>

          <div class="card-padding">
            <MarkdownContent :source="selected.content" />
          </div>
        </div>
        <div class="announcement-dialog__actions">
          <VuxButton plain type="primary" @click="showpopup = false">确认</VuxButton>
        </div>
      </div>
    </VuxPopup>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import type { Announcement } from '@/api/types'
import MarkdownContent from '@/components/MarkdownContent.vue'
import VuxButton from '@/components/ui/VuxButton.vue'
import VuxPopup from '@/components/ui/VuxPopup.vue'
import { announcementTagLabel } from '@/domain/announcement'
import { formatDateTime } from '@/domain/format'
import { formatTicketNo } from '@/domain/ticket'
import { statusLabel } from '@/domain/status'
import { useCatalogStore } from '@/stores/catalog'
import { useTicketsStore } from '@/stores/tickets'

const catalog = useCatalogStore()
const tickets = useTicketsStore()
const router = useRouter()
const showpopup = ref(false)
const selectedId = ref<number | null>(null)
const selected = computed(() => catalog.announcements.find((item) => item.id === selectedId.value) ?? null)
watch(selected, (value) => { if (!value) showpopup.value = false })

const orderedAnnouncements = computed(() =>
  [...catalog.announcements].sort((a, b) => a.priority - b.priority)
)
const room = computed(() => catalog.rooms.find((item) => item.name === tickets.working?.campus))
const campusName = computed(() => catalog.campuses.find((item) => item.id === room.value?.campus_id)?.name || '暂无校区信息')
const serviceTime = computed(() => {
  const service = catalog.datesWithRoom.find((item) => item.room_id === room.value?.id && item.dateOnly === tickets.working?.appointment_time)
  return service ? `${service.startLabel} - ${service.endLabel}` : '服务时段暂无信息'
})

async function loadAnnouncements(): Promise<void> {
  await catalog.loadAnnouncements()
}

function viewWorking(): void { void router.push({ name: 'records' }) }

function tagLabel(tag: string): string {
  return announcementTagLabel(tag)
}

function clickItem(item: Announcement, event: MouseEvent): void {
  if (event.target instanceof Element && event.target.closest('a')) return
  selectedId.value = item.id
  showpopup.value = true
}

onMounted(() => {
  void loadAnnouncements()
  void catalog.ensure()
  void tickets.refreshWorking()
})
</script>

<style scoped>
.home-message { padding: 14px; line-height: 1.8; }
.home-message .weui-btn { margin-top: 12px; }
</style>
