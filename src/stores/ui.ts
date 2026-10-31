import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastPosition = 'top' | 'middle' | 'bottom'

interface ToastState {
  show: boolean
  text: string
  position: ToastPosition
}

export const useUiStore = defineStore('ui', () => {
  const toast = ref<ToastState>({ show: false, text: '', position: 'bottom' })
  const loading = ref(false)
  let timer: number | undefined

  function show(text: string, position: ToastPosition = 'bottom'): void {
    if (timer !== undefined) {
      window.clearTimeout(timer)
    }
    toast.value = { show: true, text, position }
    timer = window.setTimeout(() => {
      toast.value = { ...toast.value, show: false }
    }, 2200)
  }

  function success(text = '操作成功'): void {
    show(text, 'bottom')
  }

  function error(text = '操作失败'): void {
    show(text, 'bottom')
  }

  function setLoading(value: boolean): void {
    loading.value = value
  }

  return { toast, loading, show, success, error, setLoading }
})
