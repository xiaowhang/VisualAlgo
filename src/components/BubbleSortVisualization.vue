<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const array = ref([]);
const sortingInProgress = ref(false);
const sortingSpeed = ref(300); // 排序速度(毫秒)
const arraySize = ref(10); // 数组大小，默认为10
const comparingIndices = ref([]);
const sortedIndices = ref([]);
let sortingTimeout = null;

// 生成随机数组
const generateRandomArray = () => {
  const newArray = [];
  for (let i = 0; i < arraySize.value; i++) {
    newArray.push(Math.floor(Math.random() * 100) + 1); // 1-100之间的随机数
  }
  array.value = newArray;
  comparingIndices.value = [];
  sortedIndices.value = [];
};

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 冒泡排序可视化
const startBubbleSort = async () => {
  if (sortingInProgress.value) return;

  sortingInProgress.value = true;
  comparingIndices.value = [];
  sortedIndices.value = [];

  const n = array.value.length;

  for (let i = 0; i < n; i++) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      // 标记当前比较的元素
      comparingIndices.value = [j, j + 1];
      await delay(sortingSpeed.value);

      if (array.value[j] > array.value[j + 1]) {
        // 交换元素
        [array.value[j], array.value[j+1]] = [array.value[j+1], array.value[j]];
        swapped = true;
        await delay(sortingSpeed.value);
      }
    }

    // 标记已经排序的元素
    sortedIndices.value.push(n - i - 1);

    // 如果没有交换，则已经排序完成
    if (!swapped) {
      // 将所有未标记为已排序的元素标记为已排序
      for (let j = 0; j < n - i - 1; j++) {
        if (!sortedIndices.value.includes(j)) {
          sortedIndices.value.push(j);
        }
      }
      break;
    }
  }

  // 清除比较标记
  comparingIndices.value = [];
  sortingInProgress.value = false;
};

// 停止排序
const stopSorting = () => {
  sortingInProgress.value = false;
  if (sortingTimeout) {
    clearTimeout(sortingTimeout);
    sortingTimeout = null;
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
    <p class="description">使用方块表示数组元素的冒泡排序过程</p>

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
          max="20"
          v-model="arraySize"
          :disabled="sortingInProgress"
          @change="generateRandomArray"
        />
        <span>{{ arraySize }}个元素</span>
      </div>
    </div>

    <div class="array-visualization">
      <transition-group name="swap" tag="div" class="array-container">
        <div
          v-for="(value, index) in array"
          :key="index"
          class="array-element"
          :class="{
            'comparing': comparingIndices.includes(index),
            'sorted': sortedIndices.includes(index)
          }"
        >
          <div class="element-square">{{ value }}</div>
          <div class="element-index">{{ index }}</div>
        </div>
      </transition-group>
    </div>

    <div class="status" v-if="sortingInProgress">
      排序中...比较元素 {{ comparingIndices[0] }} 和 {{ comparingIndices[1] }}
    </div>
    <div class="status" v-else-if="array.length > 0 && sortedIndices.length === array.length">
      排序完成!
    </div>
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

.array-visualization {
  margin: 30px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  overflow-x: auto;
}

.array-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
}

.array-element {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.5s;
}

.element-square {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4CAF50;
  color: white;
  font-weight: bold;
  font-size: 20px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.element-index {
  margin-top: 5px;
  color: #666;
  font-size: 14px;
}

.comparing .element-square {
  background-color: #FFC107;
}

.sorted .element-square {
  background-color: #3F51B5;
}

.status {
  margin-top: 15px;
  font-size: 16px;
  color: #555;
  height: 24px;
}

/* 交换动画 */
.swap-move {
  transition: transform 0.5s;
}
</style>