<template>
  <div class="vux-toast">
    <div v-if="mask" v-show="show" class="weui-mask_transparent"></div>
    <Transition name="vux-fade">
      <div
        v-if="show"
        class="weui-toast weui-toast_text"
        :class="positionClass"
      >
        <p class="weui-toast__content">{{ text }}</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ToastPosition = 'top' | 'middle' | 'bottom'

const props = withDefaults(
  defineProps<{
    show: boolean
    text: string
    position?: ToastPosition
    mask?: boolean
  }>(),
  {
    position: 'bottom',
    mask: false
  }
)

const positionClass = computed(() => `vux-toast-${props.position}`)
</script>
