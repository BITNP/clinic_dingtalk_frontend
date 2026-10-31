<template>
  <button
    class="weui-btn"
    :class="classes"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <i v-if="loading" class="weui-loading"></i>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ButtonType = 'primary' | 'warn' | 'default'

const props = withDefaults(
  defineProps<{
    type?: ButtonType
    plain?: boolean
    mini?: boolean
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    type: 'default',
    plain: false,
    mini: false,
    disabled: false,
    loading: false
  }
)

defineEmits<{
  click: [event: MouseEvent]
}>()

const classes = computed(() => [
  props.plain ? `weui-btn_plain-${props.type}` : `weui-btn_${props.type}`,
  props.mini ? 'weui-btn_mini' : '',
  props.disabled
    ? props.plain
      ? 'weui-btn_plain-disabled'
      : 'weui-btn_disabled'
    : '',
  props.loading ? 'weui-btn_loading' : ''
])
</script>
