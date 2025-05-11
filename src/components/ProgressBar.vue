<template>
  <div ref="progressRef" class="progress-bar" @mousedown.prevent="handleMouseDown">
    <el-progress
      class="cursor-pointer"
      :percentage="percentage"
      :stroke-width="22"
      :show-text="true"
      :text-inside="true"
      :format="() => `${currentStep}/${totalSteps}`"
    />
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '@/store'

const props = defineProps({
  totalSteps: {
    type: Number,
    default: 0,
  },
})

const currentStep = defineModel<number>('currentStep', {
  required: true,
})
const { pause } = usePlayerStore()

const progressRef = ref<HTMLElement | null>(null)
const isDragging = ref<boolean>(false)

// 计算百分比值
const percentage = computed(() => {
  if (props.totalSteps === 0) return 0

  return (currentStep.value / props.totalSteps) * 100
})

// 计算值
const calculateValue = (clientX: number) => {
  if (!progressRef.value) return 1
  const rect = progressRef.value.getBoundingClientRect()
  const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))

  const range = props.totalSteps - 1

  return Math.floor(1 + percent * range)
}

// 全局鼠标移动处理函数
const handleGlobalMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return

  currentStep.value = calculateValue(event.clientX)
  pause()
}

// 全局鼠标释放处理函数
const handleGlobalMouseUp = () => {
  if (!isDragging.value) return

  isDragging.value = false
  document.removeEventListener('mousemove', handleGlobalMouseMove)
  document.removeEventListener('mouseup', handleGlobalMouseUp)
}

// 鼠标按下事件处理
const handleMouseDown = (event: MouseEvent) => {
  isDragging.value = true

  document.addEventListener('mousemove', handleGlobalMouseMove)
  document.addEventListener('mouseup', handleGlobalMouseUp)

  currentStep.value = calculateValue(event.clientX)
  pause()
}

// 确保组件销毁时清理事件监听
onUnmounted(() => {
  document.removeEventListener('mousemove', handleGlobalMouseMove)
  document.removeEventListener('mouseup', handleGlobalMouseUp)
})
</script>

<style scoped>
:deep(.el-progress-bar__inner) {
  transition: none !important;
}
</style>
