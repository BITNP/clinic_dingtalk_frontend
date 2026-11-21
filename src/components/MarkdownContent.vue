<template>
  <span v-if="inline" class="markdown-body" v-html="rendered"></span>
  <div v-else class="markdown-body" v-html="rendered"></div>
</template>

<script setup lang="ts">
import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  source: string
  inline?: boolean
}>(), { inline: false })

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true
})

const rendered = computed(() => DOMPurify.sanitize(
  props.inline ? markdown.renderInline(props.source || '') : markdown.render(props.source || '')
))
</script>

<style scoped>
.markdown-body {
  word-break: break-word;
}

.markdown-body :deep(img) {
  max-width: 100%;
}
</style>
