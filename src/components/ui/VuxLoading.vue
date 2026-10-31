<template>
  <div v-show="show" class="weui-loading_toast vux-loading">
    <div class="weui-mask_transparent"></div>
    <div class="weui-toast">
      <i class="weui-loading weui-icon_toast"></i>
      <p class="weui-toast__content">{{ text || '加载中' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    show: boolean
    text?: string
  }>(),
  {
    text: ''
  }
)
</script>
