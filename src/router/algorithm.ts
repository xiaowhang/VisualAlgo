import type { RouteRecordRaw } from 'vue-router'

const algorithmComponents = import.meta.glob('/src/views/algorithm/**/*.vue')

const algorithmRoutes: RouteRecordRaw[] = []

for (const path in algorithmComponents) {
  if (path.includes('/Base.vue')) continue

  const pathSegments = path.replace('/src/views/algorithm/', '').replace('.vue', '').split('/')

  const routePath = `/${pathSegments.join('/')}`

  const routeName = pathSegments.join('-')

  const route: RouteRecordRaw = {
    path: routePath,
    component: algorithmComponents[path],
    name: routeName,
    meta: {
      title: pathSegments[pathSegments.length - 1],
      category: pathSegments.length > 1 ? pathSegments[0] : '默认分类',
    },
  }

  algorithmRoutes.push(route)
}

export default algorithmRoutes
