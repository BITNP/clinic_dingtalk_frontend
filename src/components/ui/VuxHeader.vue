<template>
  <div class="vux-header">
    <div class="vux-header-left">
      <a class="vux-header-back" href="javascript:;" @click.prevent="onBack">返回</a>
      <div class="left-arrow" @click="onBack"></div>
    </div>
    <h1 class="vux-header-title">
      <span>{{ title }}</span>
    </h1>
    <div class="vux-header-right"></div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  title: string
}>()

const router = useRouter()

function onBack(): void {
  router.back()
}
</script>
