<template>
  <van-popup
    v-model:show="show"
    position="bottom"
    round
    :style="{ height: '85%' }"
    @click-overlay="show = false"
  >
    <div class="tos">
      <div class="tos-head">
        <span>免责声明</span>
        <van-icon name="cross" @click="show = false" />
      </div>

      <div class="tos-body">
        <van-loading v-if="catalog.loading && !content" vertical>正在加载...</van-loading>
        <MarkdownContent v-else :source="content || '暂无公告'" />
      </div>

      <div class="tos-actions">
        <van-button type="primary" block round @click="show = false">返回</van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

import MarkdownContent from '@/components/MarkdownContent.vue'
import { useCatalogStore } from '@/stores/catalog'

const show = defineModel<boolean>('show', { default: false })
const catalog = useCatalogStore()

const content = computed(() => catalog.tosContent)

watch(show, (visible) => {
  if (visible) {
    void catalog.ensure()
  }
})
</script>

<style scoped>
.tos {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.tos-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid var(--clinic-border);
}

.tos-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.tos-actions {
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--clinic-border);
}
</style>
