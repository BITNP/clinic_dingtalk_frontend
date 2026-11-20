import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/MainList.vue'),
      children: [
        {
          path: '',
          name: 'announcements',
          component: () => import('@/views/Home.vue')
        },
        {
          path: 'calendar',
          name: 'calendar',
          component: () => import('@/views/Calendar.vue')
        },
        {
          path: 'records',
          name: 'records',
          component: () => import('@/views/Records.vue')
        },
        {
          path: 'working',
          redirect: { name: 'records', query: { filter: 'working' } }
        },
        {
          path: 'finish',
          redirect: { name: 'records', query: { filter: 'finished' } }
        }
      ]
    },
    {
      path: '/new',
      name: 'record',
      component: () => import('@/views/NewRecord.vue')
    },
    {
      path: '/success',
      name: 'success',
      component: () => import('@/views/Success.vue')
    }
  ]
})

export default router
