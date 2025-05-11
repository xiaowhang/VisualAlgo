<template>
  <el-card
    class="absolute right-1 top-1 gap-2"
    body-class="flex flex-col items-start gap-2"
    shadow="never"
  >
    <div class="flex flex-row">
      <el-button @click="randomDataAndResetPlayer" :disabled="isPlaying"> 生成随机数据 </el-button>
    </div>
    <PlayerControls />
  </el-card>
  <svg ref="svgRef" width="100%" height="100%" class="select-none"></svg>
</template>

<script setup lang="ts">
import * as d3 from 'd3'
import PlayerControls from '@/components/PlayerControls.vue'
import { usePlayerStore } from '@/store/usePlayerStore'
import { storeToRefs } from 'pinia'
import { createSvgCenterer } from '@/utils'
import { generateBubbleSortSteps } from '@/algorithms/bubbleSort'
import { createBarChartVisualizer } from '@/visualizers/barChartVisualizer'

const playerStore = usePlayerStore()
const { isPlaying, playerData, playerHighlight, currentAction } = storeToRefs(playerStore)
const { reset } = playerStore

const svgRef = ref<SVGSVGElement | null>(null)
const squareSize = 20
const offset = ref({ x: 0, y: 0 })
let centerSvgFn: ((offset: { x: number; y: number }) => { x: number; y: number }) | null = null
const barChartVisualizer = createBarChartVisualizer(squareSize)

onMounted(() => {
  randomDataAndResetPlayer()
  initCenterSvgFn()
  updateCenterSvg()
  setupDragEvents()
})

watch(
  [() => playerData.value, () => playerHighlight.value],
  () => {
    requestAnimationFrame(drawVisualization)
  },
  { deep: true },
)

function randomDataAndResetPlayer() {
  const newData = Array.from({ length: 20 }, () => Math.floor(Math.random() * 20) + 1)
  resetPlayer(newData)
}

function initCenterSvgFn() {
  if (svgRef.value) {
    centerSvgFn = createSvgCenterer(svgRef.value, drawVisualization)
  }
}

function updateCenterSvg() {
  if (!centerSvgFn) return
  offset.value = centerSvgFn(offset.value)
}

function drawVisualization() {
  if (!svgRef.value) return

  barChartVisualizer({
    svgElement: svgRef.value,
    data: playerData.value,
    highlight: playerHighlight.value,
    isAnimating: isPlaying.value,
    animationAction: currentAction.value,
    offset: offset.value,
  })
}

// 单独的函数来设置拖动事件
function setupDragEvents() {
  if (!svgRef.value) return

  d3.select(svgRef.value).call(
    d3
      .drag<SVGSVGElement, unknown>()
      .on('drag', (event: d3.D3DragEvent<SVGSVGElement, unknown, unknown>) => {
        offset.value.x += event.dx
        offset.value.y += event.dy
        requestAnimationFrame(drawVisualization)
      }),
  )
}

// 单独的函数来移除拖动事件
function removeDragEvents() {
  if (!svgRef.value) return
  d3.select(svgRef.value).on('.drag', null)
}

// 监听播放状态变化，适时添加或移除拖动功能
watch(
  () => isPlaying.value,
  (isCurrentlyPlaying) => {
    if (isCurrentlyPlaying) {
      removeDragEvents()
    } else {
      setupDragEvents()
    }
  },
)

onUnmounted(() => {
  removeDragEvents()
})

const resetPlayer = reset(generateBubbleSortSteps)
</script>
