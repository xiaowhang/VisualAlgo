import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      hideGlobalPlayback: true,
    },
  },
  {
    path: '/algorithm/:category/:slug',
    name: 'AlgorithmView',
    component: () => import('@/views/AlgorithmView.vue'),
    meta: {
      hideGlobalPlayback: false,
    },
  },
  {
    path: '/compare',
    name: 'CompareView',
    component: () => import('@/views/CompareView.vue'),
    meta: {
      hideGlobalPlayback: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
