<template>
  <el-aside :style="{ width: sideBarWidth + 'px' }" class="p-1 bg-white m-2 rounded shadow">
    <el-scrollbar>
      <el-menu router unique-opened class="!border-r-0">
        <template v-for="(routes, category) in groupedRoutes" :key="category">
          <el-sub-menu :index="category">
            <template #title>{{ category }}</template>
            <el-menu-item v-for="route in routes" :key="route.path" :index="route.path">
              <span>{{ route.meta?.title }}</span>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-scrollbar>
  </el-aside>
  <div class="resize-bar" @mousedown.prevent="startResize"></div>
</template>

<script setup lang="ts">
import { useSplitter } from '@/composable'
import type { RouteRecordRaw } from 'vue-router'

defineOptions({
  name: 'AsideLayout',
})

const sideBarWidth = ref(window.innerWidth * 0.13) // 初始宽度

const { startResize } = useSplitter(sideBarWidth)

const router = useRouter()
const routes = ref<RouteRecordRaw[]>([])

// 获取算法相关路由
onMounted(() => {
  routes.value = router.getRoutes().filter((route) => route.meta?.category)
})

// 按分类分组路由
const groupedRoutes = computed(() => {
  const grouped: Record<string, RouteRecordRaw[]> = {}

  routes.value.forEach((route) => {
    const category = (route.meta?.category as string) || '其他'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(route)
  })

  return grouped
})
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
