<template>
  <el-container direction="vertical" class="bg-gray-100 min-h-screen">
    <AppHeader />
    <el-container class="h-0">
      <AppAside />
      <el-main
        class="flex-1 p-4 bg-white m-2 rounded shadow flex items-center justify-center"
      >
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { AppAside, AppHeader } from '@/components'

defineOptions({
  name: 'Home',
})
</script>
