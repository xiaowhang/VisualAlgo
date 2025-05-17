import type { RouteRecordRaw } from 'vue-router'
import { categoryMap, titleMap, type Category, type Title } from '@/constants'

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
      category: categoryMap[pathSegments[0] as Category],
      title: titleMap[pathSegments[1] as Title],
    },
  }

  algorithmRoutes.push(route)
}

export default algorithmRoutes
