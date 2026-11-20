<template>
  <div class="vux-header">
    <div class="vux-header-left">
      <a v-if="!disabled" class="vux-header-back" href="javascript:;" @click.prevent="onBack">返回</a>
      <div v-if="!disabled" class="left-arrow" @click="onBack"></div>
    </div>
    <h1 class="vux-header-title">
      <span>{{ title }}</span>
    </h1>
    <div class="vux-header-right"></div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

withDefaults(defineProps<{
  title: string
  disabled?: boolean
}>(), { disabled: false })

const router = useRouter()

function onBack(): void {
  router.back()
}
</script>
