<template>
  <div>
    <div class="weui-panel weui-panel_access">
      <div class="weui-panel__hd">请点击以查看具体内容</div>
      <div class="weui-panel__bd">
        <div
          v-for="item in orderedAnnouncements"
          :key="item.id"
          class="weui-media-box weui-media-box_text"
          @click="clickItem(item)"
        >
          <h4 class="weui-media-box__title">{{ item.title }}</h4>
          <p class="weui-media-box__desc">
            [{{ tagLabel(item.tag) }}] {{ item.brief }}
          </p>
        </div>
      </div>
      <div class="weui-panel__ft"></div>
    </div>

    <br />

    <VuxPopup v-model:show="showpopup" position="right" width="100%">
      <div v-if="selected" style="z-index: 999; margin: 10px">
        <div class="weui-cells vux-no-group-title">
          <div class="weui-cell cell-grey">
            <div class="weui-cell__bd">
              <p><label class="vux-label">标题</label></p>
            </div>
            <div class="weui-cell__ft">{{ selected.title }}</div>
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

        <div class="confirm-btn">
          <VuxButton plain type="primary" @click="showpopup = false">确认</VuxButton>
        </div>
      </div>
    </VuxPopup>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import type { Announcement } from '@/api/types'
import MarkdownContent from '@/components/MarkdownContent.vue'
import VuxButton from '@/components/ui/VuxButton.vue'
import VuxPopup from '@/components/ui/VuxPopup.vue'
import { announcementTagLabel } from '@/domain/announcement'
import { formatDateTime } from '@/domain/format'
import { useCatalogStore } from '@/stores/catalog'

const catalog = useCatalogStore()
const showpopup = ref(false)
const selected = ref<Announcement | null>(null)

const orderedAnnouncements = computed(() =>
  [...catalog.announcementList].sort((a, b) => a.priority - b.priority)
)

function tagLabel(tag: string): string {
  return announcementTagLabel(tag)
}

function clickItem(item: Announcement): void {
  selected.value = item
  showpopup.value = true
}

onMounted(() => {
  void catalog.ensure()
})
</script>
