import { createRouter, createWebHistory } from 'vue-router'
import { defineAsyncComponent } from 'vue'

// Lazy load views untuk reduce main bundle
const PageLogin = defineAsyncComponent(() => import('../views/PageLogin.vue'))
const PageHome = defineAsyncComponent(() => import('../views/PageHome.vue'))
const DataBalita = defineAsyncComponent(() => import('../views/DataBalita.vue'))
const HasilPenimbangan = defineAsyncComponent(() => import('../views/HasilPenimbangan.vue'))
const KlasifikasiBalita = defineAsyncComponent(() => import('../views/KlasifikasiBalita.vue'))
const LaporanBulanan = defineAsyncComponent(() => import('../views/LaporanBulanan.vue'))

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: PageLogin,
      meta: { requiresGuest: true },
    },
    {
      path: '/home',
      name: 'home',
      component: PageHome,
    },
    {
      path: '/data-balita',
      name: 'DataBalita',
      component: DataBalita,
      meta: { requiresAuth: true },
    },
    {
      path: '/hasil-penimbangan',
      name: 'HasilPenimbangan',
      component: HasilPenimbangan,
      meta: { requiresAuth: true },
    },
    {
      path: '/klasifikasi-balita',
      name: 'KlasifikasiBalita',
      component: KlasifikasiBalita,
      meta: { requiresAuth: true },
    },
    {
      path: '/laporan-bulanan',
      name: 'LaporanBulanan',
      component: LaporanBulanan,
      meta: { requiresAuth: true },
    },
  ],
})

export default router
