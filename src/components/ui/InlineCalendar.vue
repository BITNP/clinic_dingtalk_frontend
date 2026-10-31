<template>
  <div class="inline-calendar">
    <div v-if="showHeader" class="calendar-header">
      <div class="calendar-year">
        <span @click="changeYear(-1)">
          <a class="year-prev vux-prev-icon" href="javascript:;"></a>
        </span>
        <a class="calendar-year-txt calendar-title" href="javascript:;">{{ viewYear }}</a>
        <span class="calendar-header-right-arrow" @click="changeYear(1)">
          <a class="year-next vux-next-icon" href="javascript:;"></a>
        </span>
      </div>

      <div class="calendar-month">
        <span @click="changeMonth(-1)">
          <a class="month-prev vux-prev-icon" href="javascript:;"></a>
        </span>
        <a class="calendar-month-txt calendar-title" href="javascript:;">{{ viewMonth + 1 }}</a>
        <span class="calendar-header-right-arrow" @click="changeMonth(1)">
          <a class="month-next vux-next-icon" href="javascript:;"></a>
        </span>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th v-for="(week, index) in weeks" :key="index" class="week">{{ week }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in weeksRows" :key="rowIndex">
          <td
            v-for="(cell, cellIndex) in row"
            :key="cellIndex"
            :class="cellClass(cell)"
            @click="select(cell)"
          >
            <span class="vux-calendar-each-date">{{ cell.day }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface CalendarCell {
  date: string
  day: number
  inMonth: boolean
  disabled: boolean
  current: boolean
  today: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue?: string
    disableDate?: (date: string) => boolean
    showHeader?: boolean
  }>(),
  {
    modelValue: '',
    disableDate: () => false,
    showHeader: true
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const weeks = ['日', '一', '二', '三', '四', '五', '六']
const today = new Date()
const todayKey = formatDate(today)

const initial = parseDate(props.modelValue) ?? today
const viewYear = ref(initial.getFullYear())
const viewMonth = ref(initial.getMonth())

watch(
  () => props.modelValue,
  (value) => {
    const date = parseDate(value)
    if (!date) return
    viewYear.value = date.getFullYear()
    viewMonth.value = date.getMonth()
  }
)

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function parseDate(value?: string): Date | null {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

const weeksRows = computed<CalendarCell[][]>(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1)
  const start = new Date(viewYear.value, viewMonth.value, 1 - first.getDay())
  const rows: CalendarCell[][] = []

  for (let rowIndex = 0; rowIndex < 6; rowIndex += 1) {
    const row: CalendarCell[] = []
    for (let columnIndex = 0; columnIndex < 7; columnIndex += 1) {
      const date = new Date(start)
      date.setDate(start.getDate() + rowIndex * 7 + columnIndex)
      const key = formatDate(date)
      row.push({
        date: key,
        day: date.getDate(),
        inMonth: date.getMonth() === viewMonth.value,
        disabled: props.disableDate(key),
        current: key === props.modelValue,
        today: key === todayKey
      })
    }
    rows.push(row)
  }

  return rows
})

function cellClass(cell: CalendarCell): Record<string, boolean> {
  return {
    current: cell.current,
    'is-disabled': cell.disabled,
    'is-today': cell.today
  }
}

function changeYear(delta: number): void {
  viewYear.value += delta
}

function changeMonth(delta: number): void {
  const date = new Date(viewYear.value, viewMonth.value + delta, 1)
  viewYear.value = date.getFullYear()
  viewMonth.value = date.getMonth()
}

function select(cell: CalendarCell): void {
  if (cell.disabled) return
  emit('update:modelValue', cell.date)
}
</script>
