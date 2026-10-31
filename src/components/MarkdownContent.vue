<template>
  <div class="markdown-body" v-html="rendered"></div>
</template>

<script setup lang="ts">
import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'
import { computed } from 'vue'

const props = defineProps<{
  source: string
}>()

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true
})

const rendered = computed(() => DOMPurify.sanitize(markdown.render(props.source || '')))
</script>

<style scoped>
.markdown-body {
  word-break: break-word;
}

.markdown-body :deep(img) {
  max-width: 100%;
}
</style>
