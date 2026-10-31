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
          component: () => import('@/views/Announcements.vue')
        },
        {
          path: 'calendar',
          name: 'calendar',
          component: () => import('@/views/Calendar.vue')
        },
        {
          path: 'working',
          name: 'working',
          component: () => import('@/views/WorkingRecord.vue')
        },
        {
          path: 'finish',
          name: 'finish',
          component: () => import('@/views/FinishedRecords.vue')
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
