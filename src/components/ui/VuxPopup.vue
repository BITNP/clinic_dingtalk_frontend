<template>
  <Teleport to="body">
    <Transition name="vux-fade">
      <div
        v-if="show"
        class="vux-popup-mask vux-popup-show"
        :style="{ zIndex: 500 }"
        @click="onMaskClick"
      />
    </Transition>
    <Transition :name="`vux-popup-animate-${position}`">
      <div
        v-if="show"
        class="vux-popup-dialog vux-popup-show"
        :class="`vux-popup-${position}`"
        :style="dialogStyle"
      >
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    show: boolean
    position?: 'bottom' | 'top' | 'left' | 'right'
    width?: string
    height?: string
    hideOnBlur?: boolean
  }>(),
  {
    position: 'bottom',
    width: 'auto',
    height: 'auto',
    hideOnBlur: true
  }
)

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const dialogStyle = computed<Record<string, string>>(() => {
  const style: Record<string, string> = {}
  if (props.width !== 'auto') style.width = props.width
  if (props.height !== 'auto') style.height = props.height
  return style
})

function onMaskClick(): void {
  if (props.hideOnBlur) {
    emit('update:show', false)
  }
}
</script>
