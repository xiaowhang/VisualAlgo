<template>
  <el-container direction="vertical" class="bg-gray-100 min-h-screen">
    <AppHeader />
    <el-container class="h-0">
      <AppAside />
      <el-main class="flex-1 p-1 bg-white m-2 rounded shadow relative">
        <AlgorithmBase>
          <RouterView />
        </AlgorithmBase>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { AppAside, AppHeader } from '@/components'
import AlgorithmBase from './algorithm/Base.vue'

defineOptions({
  name: 'HomePage',
})
</script>
