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
  legacyDisclaimer?: boolean
}>(), { inline: false, legacyDisclaimer: false })

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true
})

// Older disclaimer text was pasted into the editor as plain text and then
// serialized with its Markdown markers escaped. Limit compatibility to that
// recognizable combination so ordinary intentional escapes remain literal.
function normalizeDisclaimer(source: string): string {
  if (!/^\\#{1,6}\s/m.test(source) || !source.includes('\\*\\*')) return source
  return source
    .replace(/^(\s*)\\(#{1,6}\s)/gm, '$1$2')
    .replace(/\\\*\\\*/g, '**')
    .replace(/^(\s*\d+)\\\.(?=\s)/gm, '$1.')
}

const rendered = computed(() => {
  const source = props.legacyDisclaimer ? normalizeDisclaimer(props.source || '') : (props.source || '')
  return DOMPurify.sanitize(props.inline ? markdown.renderInline(source) : markdown.render(source))
})
</script>

<style scoped>
.markdown-body {
  word-break: break-word;
  line-height: 1.65;
}

.markdown-body :deep(p),
.markdown-body :deep(ul),
.markdown-body :deep(ol),
.markdown-body :deep(blockquote),
.markdown-body :deep(pre),
.markdown-body :deep(table) {
  margin: 0.75em 0;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin: 1em 0 0.5em;
  line-height: 1.3;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 1.75em;
}

.markdown-body :deep(li + li) {
  margin-top: 0.25em;
}

.markdown-body :deep(blockquote) {
  border-left: 3px solid #ccc;
  padding-left: 1em;
  color: #666;
}

.markdown-body :deep(a) {
  color: #087c48;
  text-decoration: underline;
}

.markdown-body :deep(pre) {
  overflow-x: auto;
  padding: 0.75em;
  background: #f5f5f5;
}

.markdown-body :deep(table) {
  display: block;
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid #ddd;
  padding: 0.35em 0.6em;
}

.markdown-body :deep(img) {
  max-width: 100%;
}
</style>
