<template>
  <el-aside :style="{ width: sideBarWidth + 'px' }" class="w-full p-1 bg-white m-2 rounded shadow">
    <el-scrollbar>
      <el-menu router unique-opened class="!border-r-0">
        <el-menu-item index="/BubbleSort">
          <span>冒泡排序</span>
        </el-menu-item>
      </el-menu>
    </el-scrollbar>
  </el-aside>
  <div class="resize-bar" @mousedown.prevent="startResize"></div>
</template>

<script setup lang="ts">
import { useSplitter } from '@/composable'

defineOptions({
  name: 'AsideLayout',
})

const sideBarWidth = ref(window.innerWidth * 0.13) // 初始宽度

const { startResize } = useSplitter(sideBarWidth)
</script>

<style scoped lang="scss">
.resize-bar {
  width: 13px;
  margin: 0 -6px;
  cursor: ew-resize;

  position: relative;
  z-index: 97;
}
</style>
