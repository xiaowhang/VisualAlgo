import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/algorithm/:category/:slug',
    name: 'AlgorithmView',
    component: () => import('@/views/AlgorithmView.vue'),
  },
  {
    path: '/compare',
    name: 'CompareView',
    component: () => import('@/views/CompareView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
