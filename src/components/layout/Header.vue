<template>
  <el-header
    class="flex items-center px-8 py-4 bg-white shadow-md"
  >
    <el-button link class="flex items-center">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>homepage</el-breadcrumb-item>
        <el-breadcrumb-item>promotion management </el-breadcrumb-item>
        <el-breadcrumb-item>promotion list</el-breadcrumb-item>
        <el-breadcrumb-item>promotion detail</el-breadcrumb-item>
      </el-breadcrumb>
    </el-button>
  </el-header>
</template>

<script setup>
defineOptions({
  name: 'HeaderLayout',
})
</script>
