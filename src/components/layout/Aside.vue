<template>
  <el-aside
    :style="{ width: asideWidth + 'px' }"
    class="w-full p-1 bg-white m-2 rounded shadow"
  >
    <el-scrollbar>
      <el-menu router unique-opened class="border-r-0">
        <el-sub-menu
          v-for="item in menuItems"
          :key="item.index"
          :index="item.index"
        >
          <template #title>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item
            v-for="subItem in item.subItems"
            :key="subItem.index"
            :index="subItem.index"
          >
            <el-icon><EpHomeFilled /></el-icon>
            <span>{{ subItem.title }}</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </el-aside>
  <div class="resize-bar" @mousedown="startResize"></div>
</template>

<script setup>
defineOptions({
  name: 'AsideLayout',
})

const menuItems = Array.from({ length: 10 }, (_, index) => ({
  index: `/menu${index + 1}`,
  title: `菜单 ${index + 1}`,
  subItems: Array.from(
    { length: Math.floor(Math.random() * 10) + 1 },
    (_, subIndex) => ({
      index: `/submenu${index + 1}-${subIndex + 1}`,
      title: `子菜单 ${subIndex + 1}`,
    })
  ),
}))

const asideWidth = ref(window.innerWidth * 0.13) // 初始宽度

let startX = 0

const startResize = (e) => {
  startX = e.clientX
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', stopResize)
}

const onMouseMove = (e) => {
  const diff = e.clientX - startX
  asideWidth.value = Math.max(asideWidth.value + diff, 100)
  startX = e.clientX
}

const stopResize = () => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', stopResize)
}
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
