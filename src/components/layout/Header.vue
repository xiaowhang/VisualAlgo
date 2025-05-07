<template>
  <el-header class="flex items-center px-8 py-4 bg-white shadow-md">
    <el-button link class="flex items-center">
      <el-breadcrumb :separator-icon="ArrowRight" class="text-lg">
        <el-breadcrumb-item>Algorithm-Visualizer</el-breadcrumb-item>
        <el-breadcrumb-item
          v-for="(item, index) in $route.matched.slice(1)"
          :key="index"
        >
          {{ item.name }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </el-button>
  </el-header>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue'
defineOptions({
  name: 'HeaderLayout',
})
</script>

<style scoped lang="scss">
:deep(.el-breadcrumb) {
  .el-breadcrumb__item .el-breadcrumb__inner {
    font-weight: 500;
    cursor: pointer;
  }
}
</style>
