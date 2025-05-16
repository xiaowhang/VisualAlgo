import type { RouteRecordRaw } from 'vue-router'

const categoryMap: Record<string, string> = {
  sorting: '排序',
}

const titleMap: Record<string, string> = {
  BubbleSort: '冒泡排序',
  SelectionSort: '选择排序',
  InsertionSort: '插入排序',
  ShellSort: '希尔排序',
}

const algorithmComponents = import.meta.glob('/src/views/algorithm/**/*.vue')

const algorithmRoutes: RouteRecordRaw[] = []

for (const path in algorithmComponents) {
  if (path.includes('/Base.vue')) continue

  const pathSegments = path.replace('/src/views/algorithm/', '').replace('.vue', '').split('/')

  const routePath = `/${pathSegments.join('/')}`

  const routeName = pathSegments[1]

  const route: RouteRecordRaw = {
    path: routePath,
    component: algorithmComponents[path],
    name: routeName,
    meta: {
      category: categoryMap[pathSegments[0]],
      title: titleMap[pathSegments[1]],
    },
  }

  algorithmRoutes.push(route)
}

export default algorithmRoutes
