import { createRouter, createWebHistory } from 'vue-router'

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
      {
        path: 'BubbleSort',
        name: 'BubbleSort',
        component: () => import('@/views/algorithm/BubbleSort.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
