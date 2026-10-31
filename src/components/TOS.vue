<template>
  <VuxPopup v-model:show="show" height="100%">
    <div class="popup">
      <div id="toc">
        <MarkdownContent :source="content" />
      </div>
      <br />
      <VuxButton @click="close">返回</VuxButton>
    </div>
  </VuxPopup>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

import MarkdownContent from '@/components/MarkdownContent.vue'
import VuxButton from '@/components/ui/VuxButton.vue'
import VuxPopup from '@/components/ui/VuxPopup.vue'
import { useCatalogStore } from '@/stores/catalog'

const show = defineModel<boolean>({ default: false })
const catalog = useCatalogStore()

const content = computed(() => catalog.tosContent || '无')

function close(): void {
  show.value = false
}

watch(show, (visible) => {
  if (visible) {
    void catalog.ensure()
  }
})
</script>
