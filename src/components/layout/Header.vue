<template>
  <el-header class="flex items-center px-8 py-4 bg-white shadow-md">
    <el-button link class="flex items-center">
      <el-breadcrumb :separator-icon="ArrowRight" class="!text-xl">
        <el-breadcrumb-item>算法可视化工具</el-breadcrumb-item>
        <el-breadcrumb-item>{{ $route.meta.category }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ $route.meta.title }}</el-breadcrumb-item>
      </el-breadcrumb>
    </el-button>
  </el-header>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
defineOptions({
  name: 'HeaderLayout',
})
</script>

<style scoped lang="scss">
:deep(.el-breadcrumb) {
  .el-breadcrumb__item .el-breadcrumb__inner {
    font-weight: 700;
    cursor: pointer;
  }
}
</style>
