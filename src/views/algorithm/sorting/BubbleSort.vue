<template>
  <el-card
    class="absolute right-1 top-1 gap-2"
    body-class="flex flex-col items-start gap-2"
    shadow="never"
  >
    <div class="flex flex-row">
      <el-button @click="resetWithRandomData" :disabled="isPlaying"> 生成随机数据 </el-button>
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
import { useSvg } from '@/composable'

const playerStore = usePlayerStore()
const { isPlaying, playerData, playerHighlight, playerInterval } = storeToRefs(playerStore)
const { createResetHandler } = playerStore

const svgStore = useSvgStore()
const { svgRef } = storeToRefs(svgStore)

const renderBarChart = createBarChartVisualizer()

const { centerSvg } = useSvg(drawVisualization)

onMounted(() => {
  resetWithRandomData()
})

watch(
  [() => playerData.value, () => playerHighlight.value],
  () => {
    requestAnimationFrame(drawVisualization)
  },
  { deep: true },
)

function generateRandomData() {
  return Array.from({ length: 25 }, () => Math.floor(Math.random() * 20) + 1)
}

function resetWithRandomData() {
  const newData = generateRandomData()
  resetPlayer(newData)
  centerSvg()
}

function drawVisualization() {
  if (!svgRef.value) return

  renderBarChart({
    svgElement: svgRef.value,
    data: playerData.value,
    highlight: playerHighlight.value,
    animationDuration: playerInterval.value,
  })
}

const resetPlayer = createResetHandler(generateBubbleSortSteps)
</script>
