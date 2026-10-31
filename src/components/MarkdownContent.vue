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
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  margin: 16px 0 8px;
  font-size: 16px;
}

.markdown-body :deep(p) {
  margin: 8px 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 20px;
}

.markdown-body :deep(a) {
  color: var(--clinic-primary);
}

.markdown-body :deep(img) {
  max-width: 100%;
}
</style>
