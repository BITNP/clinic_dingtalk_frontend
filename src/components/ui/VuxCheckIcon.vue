<template>
  <div class="vux-check-icon" @click="toggle">
    <i :class="modelValue ? 'weui-icon-success' : 'weui-icon-circle'"></i>
    <span><slot /></span>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<boolean>({ default: false })

function toggle(): void {
  model.value = !model.value
}
</script>
