<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as d3 from 'd3';

const props = defineProps({
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 400
  }
});

const chartContainer = ref(null);
const array = ref([]);
const sortingInProgress = ref(false);
const sortingSpeed = ref(300); // 排序速度(毫秒)
const arraySize = ref(20); // 数组大小
let sortingInterval = null;
const margin = { top: 40, right: 20, bottom: 30, left: 20 }; // 增加顶部边距，为标签留出空间

// 生成随机数组
const generateRandomArray = () => {
  const newArray = [];
  for (let i = 0; i < arraySize.value; i++) {
    newArray.push(Math.floor(Math.random() * 100) + 5); // 5-104之间的随机数
  }
  array.value = newArray;
  renderChart();
};

// 渲染图表
const renderChart = () => {
  if (!chartContainer.value) return;

  const svg = d3.select(chartContainer.value);
  svg.selectAll("*").remove();

  const width = props.width - margin.left - margin.right;
  const height = props.height - margin.top - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // 设置x轴比例尺
  const x = d3.scaleBand()
    .domain(array.value.map((_, i) => i))
    .range([0, width])
    .padding(0.1);

  // 设置y轴比例尺 (现在只用于计算高度比例，不再用于垂直定位)
  const y = d3.scaleLinear()
    .domain([0, d3.max(array.value)])
    .range([0, height * 0.8]); // 使用正向比例尺，让高度正比于数值

  // 柱子的基准线位置（所有柱子的底部位置）
  const baseLineY = height;

  // 添加柱状图
  const bars = g.selectAll(".bar")
    .data(array.value)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", (d, i) => x(i))
    .attr("y", d => baseLineY - y(d)) // 从基准线向上绘制柱子
    .attr("width", x.bandwidth())
    .attr("height", d => y(d))
    .attr("fill", "#4CAF50");

  // 添加数值标签
  g.selectAll(".value-label")
    .data(array.value)
    .enter().append("text")
    .attr("class", "value-label")
    .attr("x", (d, i) => x(i) + x.bandwidth() / 2)
    .attr("y", d => baseLineY - y(d) - 10) // 标签位于柱子上方固定距离
    .attr("text-anchor", "middle")
    .text(d => d);

  return { g, x, y, baseLineY };
};

// 冒泡排序可视化
const startBubbleSort = async () => {
  if (sortingInProgress.value) return;
  sortingInProgress.value = true;

  const arr = [...array.value];
  const n = arr.length;
  let i = 0;
  let j = 0;
  let swapped = false;

  const { g, x, y, baseLineY } = renderChart();

  sortingInterval = setInterval(() => {
    // 如果当前一轮比较已经完成
    if (j >= n - i - 1) {
      j = 0;
      i++;

      // 如果没有发生交换或者已经完成所有轮次，则排序结束
      if (!swapped || i >= n - 1) {
        sortingInProgress.value = false;
        clearInterval(sortingInterval);

        // 排序完成后的最终渲染
        renderChart();
        return;
      }

      swapped = false;
    }

    // 将所有柱子恢复为绿色
    g.selectAll("rect")
      .attr("fill", "#4CAF50");

    // 高亮当前比较的两个柱子
    g.selectAll("rect")
      .filter((d, idx) => idx === j || idx === j + 1)
      .attr("fill", "#FFC107");

    // 如果左边的值大于右边的值，则交换
    if (arr[j] > arr[j + 1]) {
      // 交换数组中的值
      [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      swapped = true;

      // 更新可视化 - 只做水平交换
      // 1. 更新数据绑定
      const bars = g.selectAll(".bar").data(arr);
      const labels = g.selectAll(".value-label").data(arr);

      // 2. 应用水平交换动画 (只改变x坐标)
      bars.transition()
        .duration(sortingSpeed.value / 2)
        .attr("x", (d, i) => x(i))
        .attr("y", d => baseLineY - y(d))
        .attr("height", d => y(d));

      // 同步更新标签位置 (水平移动到对应柱子上方)
      labels.transition()
        .duration(sortingSpeed.value / 2)
        .attr("x", (d, i) => x(i) + x.bandwidth() / 2)
        .attr("y", d => baseLineY - y(d) - 10)
        .text(d => d);
    }

    array.value = [...arr];
    j++;
  }, sortingSpeed.value);
};

// 停止排序
const stopSorting = () => {
  if (sortingInterval) {
    clearInterval(sortingInterval);
    sortingInProgress.value = false;
  }
};

// 在组件挂载时初始化
onMounted(() => {
  generateRandomArray();
});

// 在组件销毁时清理
onUnmounted(() => {
  stopSorting();
});
</script>

<template>
  <div class="bubble-sort-container">
    <h2>冒泡排序可视化</h2>
    <p class="description">展示柱子水平交换的冒泡排序过程</p>

    <div class="controls">
      <button @click="generateRandomArray" :disabled="sortingInProgress">生成新数组</button>
      <button @click="startBubbleSort" :disabled="sortingInProgress">开始排序</button>
      <button @click="stopSorting" :disabled="!sortingInProgress">停止排序</button>

      <div class="slider-container">
        <label for="speed">速度: </label>
        <input
          id="speed"
          type="range"
          min="50"
          max="1000"
          step="50"
          v-model="sortingSpeed"
          :disabled="sortingInProgress"
        />
        <span>{{ sortingSpeed }}ms</span>
      </div>

      <div class="slider-container">
        <label for="size">数组大小: </label>
        <input
          id="size"
          type="range"
          min="5"
          max="50"
          step="5"
          v-model="arraySize"
          :disabled="sortingInProgress"
          @change="generateRandomArray"
        />
        <span>{{ arraySize }}个元素</span>
      </div>
    </div>

    <svg ref="chartContainer" :width="width" :height="height"></svg>
  </div>
</template>

<style scoped>
.bubble-sort-container {
  margin: 20px auto;
  text-align: center;
  max-width: 900px;
}

.description {
  color: #666;
  margin-bottom: 15px;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

button {
  padding: 8px 16px;
  margin: 0 5px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.slider-container {
  display: flex;
  align-items: center;
  margin: 0 10px;
}

input[type="range"] {
  margin: 0 10px;
}

svg {
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
</style>