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

const playerStore = usePlayerStore()
const { algorithmSteps, currentStep, isPlaying, playerData, playerHighlight, currentAction } =
  storeToRefs(playerStore)
const { reset } = playerStore

const svgRef = ref<SVGSVGElement | null>(null)
const squareSize = 20
const offset = { x: 0, y: 0 }

onMounted(() => {
  randomDataAndResetPlayer()
  centerSvg()
})

watch(
  [() => playerData.value, () => playerHighlight.value],
  () => {
    requestAnimationFrame(drawSquares)
  },
  { deep: true },
)

function randomDataAndResetPlayer() {
  const newData = Array.from({ length: 20 }, () => Math.floor(Math.random() * 20) + 1)
  resetPlayer(newData) // 这将设置 initialData 并生成步骤
}

function centerSvg() {
  const svgNode = svgRef.value
  if (!svgNode) return

  drawSquares() // 确保在计算大小之前绘制一次

  const { clientHeight: svgHeight, clientWidth: svgWidth } = svgNode
  const { width: gWidth, height: gHeight } = svgNode.getBBox()

  offset.x = (svgWidth - gWidth) / 2
  offset.y = (svgHeight - gHeight) / 2
}

function drawSquares() {
  const svg = d3.select(svgRef.value)

  const currentDataToDraw = playerData.value // {id, value} 对象数组
  if (!currentDataToDraw) {
    svg.selectAll('*').remove() // 如果数据为 null/undefined 则清除
    return
  }
  // 如果 currentDataToDraw 是一个空数组，我们将继续让 D3 处理退出，这将清除视觉效果。

  const currentHighlight = playerHighlight.value
  const isSwapAnimating = isPlaying && currentAction.value === 'swap'
  const animationDuration = isSwapAnimating ? 300 : 0

  const maxHeightValue =
    currentDataToDraw.length > 0 ? Math.max(0, ...currentDataToDraw.map((d) => d.value)) : 0
  const maxHeight = maxHeightValue > 0 ? maxHeightValue * squareSize : squareSize

  let g = svg.select<SVGGElement>('g.main-group')
  if (g.empty()) {
    g = svg.append('g').attr('class', 'main-group')
  }
  g.attr('transform', `translate(${offset.x},${offset.y})`)

  // ---- 矩形 ----
  const rectSelection = g
    .selectAll<SVGRectElement, { id: number; value: number }>('rect.bar')
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
      d.value * squareSize > 0 ? d.value * squareSize : d.value === 0 ? 1 : 0,
    )
    .attr('rx', 3)
    .attr('ry', 3)
    .attr('x', (d, i) => i * (squareSize + squareSize / 10))
    .attr('fill', (d, i) => (currentHighlight.includes(i) ? '#FF9800' : '#4CAF50'))

  rectSelection
    .merge(enterRects)
    .transition()
    .duration(animationDuration)
    .attr('x', (d, i) => i * (squareSize + squareSize / 10))
    .attr('y', (d) => maxHeight - d.value * squareSize)
    .attr('height', (d) =>
      d.value * squareSize > 0 ? d.value * squareSize : d.value === 0 ? 1 : 0,
    )
    .attr('fill', (d, i) => (currentHighlight.includes(i) ? '#FF9800' : '#4CAF50'))

  // ---- 文本标签 ----
  const textSelection = g
    .selectAll<SVGTextElement, { id: number; value: number }>('text.value-label')
    .data(currentDataToDraw, (d) => d.id) // 使用 id 作为键

  textSelection.exit().transition().duration(animationDuration).attr('opacity', 0).remove()

  const enterTexts = textSelection
    .enter()
    .append('text')
    .attr('class', 'value-label')
    .attr('data-id', (d) => d.id)
    .attr('y', maxHeight + 15)
    .attr('text-anchor', 'middle')
    .attr('font-size', 14)
    .attr('x', (d, i) => i * (squareSize + squareSize / 10) + squareSize / 2)
    .attr('fill', (d, i) => (currentHighlight.includes(i) ? '#FF9800' : '#4CAF50'))
    .text((d) => d.value)

  textSelection
    .merge(enterTexts)
    .transition()
    .duration(animationDuration)
    .attr('x', (d, i) => i * (squareSize + squareSize / 10) + squareSize / 2)
    .attr('fill', (d, i) => (currentHighlight.includes(i) ? '#FF9800' : '#4CAF50'))
    .text((d) => d.value)

  // 拖动处理保持不变，因为它修改 offset.x/y，从而触发重绘。
  if (!isPlaying.value) {
    ;(svg as d3.Selection<SVGSVGElement, unknown, null, undefined>).call(
      d3.drag<SVGSVGElement, unknown>().on('drag', (event) => {
        offset.x += event.dx
        offset.y += event.dy
        requestAnimationFrame(drawSquares) // 拖动时重绘
      }),
    )
  } else {
    svg.on('.drag', null) // 播放时移除拖动监听器
  }
}

function generateSortSteps(dataWithIdsInput: { id: number; value: number }[]) {
  // dataWithIdsInput 是一个 {id, value} 对象的数组。
  // initialData.value 已由 resetPlayer 设置为 dataWithIdsInput 的初始状态。
  algorithmSteps.value = []
  // 创建数组结构的可变副本，但重用项目对象进行排序。
  const arr = dataWithIdsInput.slice()
  const n = arr.length

  algorithmSteps.value.push({
    data: arr.slice(), // 存储数组的快照（对象引用数组）
    highlight: [],
    action: 'initial',
  })

  let swapped = true
  for (let i = 0; i < n - 1 && swapped; i++) {
    swapped = false
    for (let j = 0; j < n - 1 - i; j++) {
      algorithmSteps.value.push({
        data: arr.slice(),
        highlight: [j, j + 1],
        action: 'compare',
      })
      if (arr[j].value > arr[j + 1].value) {
        // 按 .value 比较
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]] // 交换 arr 中的对象
        swapped = true
        algorithmSteps.value.push({
          data: arr.slice(),
          highlight: [j, j + 1],
          action: 'swap',
        })
      }
    }
    if (!swapped && i < n - 2) {
      // 如果没有发生交换并且不是最后一次遍历
      // 优化：如果数组提前排序完毕，所有剩余元素都已就位。
      // 我们可以添加一个 'sorted' 步骤并中断循环。
    }
  }
  algorithmSteps.value.push({
    data: arr.slice(),
    highlight: [],
    action: 'sorted',
  })

  currentStep.value = 1
  isPlaying.value = false
}

const resetPlayer = reset(generateSortSteps)
</script>
