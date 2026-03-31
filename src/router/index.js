import { createRouter, createWebHistory } from 'vue-router'
import PageHome from '../views/PageHome.vue'
import PageLogin from '../views/PageLogin.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: PageLogin,
    meta: { requiresGuest: true },
  },
    {
      path: '/home',
      name: 'home',
      component: PageHome,
    },
  ],

})

export default router
