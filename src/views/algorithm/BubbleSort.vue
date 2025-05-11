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
</template>

<script setup lang="ts">
import PlayerControls from '@/components/PlayerControls.vue'
import { usePlayerStore, useSvgStore } from '@/store'
import { storeToRefs } from 'pinia'
import { generateBubbleSortSteps } from '@/algorithms/bubbleSort'
import { createBarChartVisualizer } from '@/visualizers/barChartVisualizer'
import { useSvgDrag, useSvgCenter } from '@/composable'

const playerStore = usePlayerStore()
const { isPlaying, playerData, playerHighlight, currentAction } = storeToRefs(playerStore)
const { reset } = playerStore

const svgStore = useSvgStore()
const { svgRef, offset } = storeToRefs(svgStore)

const squareSize = 20
const barChartVisualizer = createBarChartVisualizer(squareSize)

const { centerSvg } = useSvgCenter(drawVisualization)

onMounted(() => {
  randomDataAndResetPlayer()
  centerSvg()
})

useSvgDrag(drawVisualization)

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

const resetPlayer = reset(generateBubbleSortSteps)
</script>
