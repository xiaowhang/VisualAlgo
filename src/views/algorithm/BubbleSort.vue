<template>
  <div class="absolute right-1 top-1 flex gap-2">
    <el-button @click="randomData" :disabled="sorting">生成随机数据</el-button>
    <el-button @click="startSort" :disabled="sorting">开始排序</el-button>
    <el-button @click="stopSort" :disabled="!sorting">终止</el-button>
  </div>
  <svg ref="svgRef" width="100%" height="100%"></svg>
</template>

<script setup>
import * as d3 from 'd3'

const data = ref([])
const sorting = ref(false)
const highlight = ref({ i: -1, j: -1 })
const svgRef = ref(null)
const squareSize = 20 // 缩放比例，每个单位对应多少像素
let offset = { x: 0, y: 0 }

onMounted(() => {
  randomData()
  centerSvg()
  drawSquares()
})

watch([data, highlight], drawSquares)

function randomData() {
  // 随机生成20个1-30的整数
  data.value = Array.from(
    { length: 20 },
    () => Math.floor(Math.random() * 20) + 1
  )
  highlight.value = { i: -1, j: -1 }
}

// 居中svg
function centerSvg() {
  const svgNode = svgRef.value
  const svgWidth = svgNode.clientWidth || 800
  const svgHeight = svgNode.clientHeight || 600

  // 计算所有方块的总宽度和最大高度
  const totalWidth = data.value.length * (squareSize + squareSize / 10)
  const maxHeight = Math.max(...data.value) * squareSize

  // 计算使g居中的偏移量
  offset.x = (svgWidth - totalWidth) / 2
  offset.y = (svgHeight - maxHeight) / 2
}

function drawSquares() {
  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove() // 清空

  const maxHeight = Math.max(...data.value) * squareSize

  // 新建一个g元素用于拖拽
  const g = svg
    .append('g')
    .attr('transform', `translate(${offset.x},${offset.y})`)

  // 绘制矩形
  g.selectAll('rect')
    .data(
      data.value.map((d, i) => ({ d, i })),
      (d) => d.i
    )
    .enter()
    .append('rect')
    .attr('data-index', (d) => d.i)
    .attr('x', (d, i) => i * (squareSize + squareSize / 10))
    .attr('y', (d) => maxHeight - d.d * squareSize)
    .attr('width', squareSize)
    .attr('height', (d) => d.d * squareSize)
    .attr('fill', (d, i) => {
      if (i === highlight.value.i || i === highlight.value.j) return '#FF9800'
      return '#4CAF50'
    })
    .attr('rx', 3)
    .attr('ry', 3)

  // 添加数据标注
  g.selectAll('text')
    .data(
      data.value.map((d, i) => ({ d, i })),
      (d) => d.i
    )
    .enter()
    .append('text')
    .attr('data-index', (d) => d.i)
    .attr('x', (d, i) => i * (squareSize + squareSize / 10) + squareSize / 2)
    .attr('y', (d) => maxHeight + 15)
    .attr('text-anchor', 'middle')
    .attr('font-size', 14)
    .attr('fill', (d, i) =>
      i === highlight.value.i || i === highlight.value.j ? '#FF9800' : '#4CAF50'
    )
    .text((d) => d.d)

  // 拖拽行为
  svg.call(
    d3.drag().on('drag', (event) => {
      offset.x += event.dx
      offset.y += event.dy
      g.attr('transform', `translate(${offset.x},${offset.y})`)
    })
  )
}

// 交换动画
async function animateSwap(i, j) {
  const svg = d3.select(svgRef.value)
  const g = svg.select('g')
  const dx = (j - i) * (squareSize + squareSize / 10)

  // rect动画
  const rects = g.selectAll('rect')
  const texts = g.selectAll('text')

  // 只移动i和j
  rects
    .filter(function (_, idx) {
      return idx === i
    })
    .transition()
    .duration(300)
    .attr('x', i * (squareSize + squareSize / 10) + dx)
  rects
    .filter(function (_, idx) {
      return idx === j
    })
    .transition()
    .duration(300)
    .attr('x', j * (squareSize + squareSize / 10) - dx)

  texts
    .filter(function (_, idx) {
      return idx === i
    })
    .transition()
    .duration(300)
    .attr('x', i * (squareSize + squareSize / 10) + squareSize / 2 + dx)
  texts
    .filter(function (_, idx) {
      return idx === j
    })
    .transition()
    .duration(300)
    .attr('x', j * (squareSize + squareSize / 10) + squareSize / 2 - dx)

  await sleep(320)
}

// 冒泡排序动画
async function startSort() {
  sorting.value = true
  let arr = data.value.slice()
  let n = arr.length
  outer: for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      if (!sorting.value) break outer
      highlight.value = { i: j, j: j + 1 }
      await sleep(300)
      if (!sorting.value) break outer
      if (arr[j] > arr[j + 1]) {
        await animateSwap(j, j + 1)
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        data.value = arr.slice()
        await sleep(100)
        if (!sorting.value) break outer
      }
    }
  }
  highlight.value = { i: -1, j: -1 }
  sorting.value = false
}

function stopSort() {
  sorting.value = false
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
</script>
