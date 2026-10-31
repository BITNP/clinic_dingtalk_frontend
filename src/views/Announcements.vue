<template>
  <div>
    <van-cell-group inset class="announcement-list">
      <van-cell
        v-for="item in catalog.announcementList"
        :key="item.id"
        :title="item.title"
        :label="`[${tagLabel(item.tag)}] ${item.brief}`"
        is-link
        @click="open(item)"
      />
    </van-cell-group>

    <van-empty v-if="!catalog.announcementList.length && !catalog.loading" description="暂无公告" />

    <van-popup v-model:show="showPopup" position="right" :style="{ width: '100%', height: '100%' }">
      <div v-if="selected" class="announcement-popup">
        <van-nav-bar :title="selected.title" left-arrow @click-left="showPopup = false" />

        <div class="announcement-meta">
          <van-tag :type="tagType(selected.tag) || undefined">
            {{ tagLabel(selected.tag) }}
          </van-tag>
          <span class="muted">{{ formatDateTime(selected.lastEditedTime) }}</span>
        </div>

        <div class="announcement-body">
          <MarkdownContent :source="selected.content" />
        </div>

        <div class="announcement-actions">
          <van-button type="primary" block round @click="showPopup = false"> 确认 </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import type { Announcement } from '@/api/types'
import MarkdownContent from '@/components/MarkdownContent.vue'
import { formatDateTime } from '@/domain/format'
import { useCatalogStore } from '@/stores/catalog'

const catalog = useCatalogStore()
const showPopup = ref(false)
const selected = ref<Announcement | null>(null)

const TAG_LABELS: Record<string, string> = {
  normal: '普通公告',
  pinned: '置顶公告',
  tos: '免责声明',
  // Legacy spellings kept only for old data during rollout.
  AN: '普通公告',
  TA: '置顶公告',
  TOS: '免责声明'
}

function tagLabel(tag: string): string {
  return TAG_LABELS[tag] ?? tag
}

function tagType(tag: string): 'primary' | 'warning' | 'success' | '' {
  if (tag === 'pinned' || tag === 'TA') return 'warning'
  if (tag === 'tos' || tag === 'TOS') return 'primary'
  return ''
}

function open(item: Announcement): void {
  selected.value = item
  showPopup.value = true
}

onMounted(() => {
  void catalog.ensure()
})
</script>

<style scoped>
.announcement-list {
  margin-top: 12px;
}

.announcement-popup {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.announcement-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--clinic-border);
}

.announcement-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.announcement-actions {
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--clinic-border);
}
</style>
