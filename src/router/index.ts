import { createRouter, createWebHistory } from 'vue-router'
import algorithmRoutes from './algorithm'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    children: [
      {
        path: '',
        name: 'Welcome',
        component: () => import('@/views/Welcome.vue'),
      },
      ...algorithmRoutes,
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
