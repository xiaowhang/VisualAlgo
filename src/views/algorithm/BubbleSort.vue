<template>
  <el-card
    class="absolute right-1 top-1 gap-2"
    body-class="flex flex-col items-start gap-2"
    shadow="never"
  >
    <div class="flex flex-row">
      <el-button
        @click="randomDataAndResetPlayer"
        :disabled="playerStore.isPlaying"
      >
        生成随机数据
      </el-button>
    </div>
    <PlayerControls />
  </el-card>
  <svg ref="svgRef" width="100%" height="100%" class="select-none"></svg>
</template>

<script setup>
import * as d3 from 'd3'
import PlayerControls from '@/components/PlayerControls.vue' // 假设 @ 指向 src 目录
import { usePlayerStore } from '@/store/usePlayerStore' // 假设 @ 指向 src 目录

const playerStore = usePlayerStore()

const svgRef = ref(null)
const squareSize = 20
const offset = { x: 0, y: 0 }

onMounted(() => {
  randomDataAndResetPlayer()
})

watch(
  [
    () => playerStore.playerData,
    () => playerStore.playerHighlight,
    () => offset.x,
    () => offset.y,
  ],
  () => {
    if (playerStore.playerData && playerStore.playerData.length > 0) {
      centerSvg() // 如果数据可能改变并影响尺寸，则重新居中
      requestAnimationFrame(drawSquares)
    }
  },
  { deep: true, immediate: true }
)

function randomDataAndResetPlayer() {
  const newData = Array.from(
    { length: 20 },
    () => Math.floor(Math.random() * 20) + 1
  )
  playerStore.resetPlayer(newData) // 这将设置 initialData 并生成步骤
}

function centerSvg() {
  const svgNode = svgRef.value
  if (!svgNode) return
  const svgWidth = svgNode.clientWidth
  const svgHeight = svgNode.clientHeight

  const currentDataForSizing = playerStore.playerData // 现在是 {id, value} 对象数组
  if (!currentDataForSizing || currentDataForSizing.length === 0) return

  const totalWidth =
    currentDataForSizing.length * (squareSize + squareSize / 10)
  // 使用 .value 获取用于调整大小的数值
  const maxHeight =
    Math.max(0, ...currentDataForSizing.map((d) => d.value)) * squareSize

  offset.x = (svgWidth - totalWidth) / 2
  offset.y = (svgHeight - maxHeight) / 2
}

function drawSquares() {
  const svg = d3.select(svgRef.value)

  const currentDataToDraw = playerStore.playerData // {id, value} 对象数组
  if (!currentDataToDraw) {
    svg.selectAll('*').remove() // 如果数据为 null/undefined 则清除
    return
  }
  // 如果 currentDataToDraw 是一个空数组，我们将继续让 D3 处理退出，这将清除视觉效果。

  const currentHighlight = playerStore.playerHighlight
  const isSwapAnimating =
    playerStore.isPlaying && playerStore.currentAction === 'swap'
  const animationDuration = isSwapAnimating ? 300 : 0

  const maxHeightValue =
    currentDataToDraw.length > 0
      ? Math.max(0, ...currentDataToDraw.map((d) => d.value))
      : 0
  const maxHeight =
    maxHeightValue > 0 ? maxHeightValue * squareSize : squareSize

  let g = svg.select('g.main-group')
  if (g.empty()) {
    g = svg.append('g').attr('class', 'main-group')
  }
  g.attr('transform', `translate(${offset.x},${offset.y})`)

  // ---- 矩形 ----
  const rectSelection = g
    .selectAll('rect.bar')
    .data(currentDataToDraw, (d) => d.id) // 使用 id 作为键

  rectSelection
    .exit()
    .transition()
    .duration(animationDuration)
    .attr('opacity', 0)
    .attr('height', 0)
    .attr('y', maxHeight)
    .remove()

  const enterRects = rectSelection
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('data-id', (d) => d.id)
    .attr('y', (d) => maxHeight - d.value * squareSize)
    .attr('width', squareSize)
    .attr('height', (d) =>
      d.value * squareSize > 0 ? d.value * squareSize : d.value === 0 ? 1 : 0
    )
    .attr('rx', 3)
    .attr('ry', 3)
    .attr('x', (d, i) => i * (squareSize + squareSize / 10))
    .attr('fill', (d, i) =>
      i === currentHighlight.i || i === currentHighlight.j
        ? '#FF9800'
        : '#4CAF50'
    )

  rectSelection
    .merge(enterRects)
    .transition()
    .duration(animationDuration)
    .attr('x', (d, i) => i * (squareSize + squareSize / 10))
    .attr('y', (d) => maxHeight - d.value * squareSize)
    .attr('height', (d) =>
      d.value * squareSize > 0 ? d.value * squareSize : d.value === 0 ? 1 : 0
    )
    .attr('fill', (d, i) =>
      i === currentHighlight.i || i === currentHighlight.j
        ? '#FF9800'
        : '#4CAF50'
    )

  // ---- 文本标签 ----
  const textSelection = g
    .selectAll('text.value-label')
    .data(currentDataToDraw, (d) => d.id) // 使用 id 作为键

  textSelection
    .exit()
    .transition()
    .duration(animationDuration)
    .attr('opacity', 0)
    .remove()

  const enterTexts = textSelection
    .enter()
    .append('text')
    .attr('class', 'value-label')
    .attr('data-id', (d) => d.id)
    .attr('y', maxHeight + 15)
    .attr('text-anchor', 'middle')
    .attr('font-size', 14)
    .attr('x', (d, i) => i * (squareSize + squareSize / 10) + squareSize / 2)
    .attr('fill', (d, i) =>
      i === currentHighlight.i || i === currentHighlight.j
        ? '#FF9800'
        : '#4CAF50'
    )
    .text((d) => d.value)

  textSelection
    .merge(enterTexts)
    .transition()
    .duration(animationDuration)
    .attr('x', (d, i) => i * (squareSize + squareSize / 10) + squareSize / 2)
    .attr('fill', (d, i) =>
      i === currentHighlight.i || i === currentHighlight.j
        ? '#FF9800'
        : '#4CAF50'
    )
    .text((d) => d.value)

  // 拖动处理保持不变，因为它修改 offset.x/y，从而触发重绘。
  if (!playerStore.isPlaying) {
    svg.call(
      d3.drag().on('drag', (event) => {
        offset.x += event.dx
        offset.y += event.dy
        requestAnimationFrame(drawSquares) // 拖动时重绘
      })
    )
  } else {
    svg.on('.drag', null) // 播放时移除拖动监听器
  }
}
</script>
