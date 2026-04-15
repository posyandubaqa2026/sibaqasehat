<template>
  <div class="dashboard" :class="{ 'sidebar-collapsed': sidebarCollapsed, 'mobile-nav-open': mobileNavOpen }">
    <!-- Mobile Overlay -->
    <div class="mobile-overlay" @click="mobileNavOpen = false"></div>

    <!-- Sidebar -->
    <SideNavBar
      :collapsed="sidebarCollapsed"
      :activeNav="activeNav"
      :currentUser="currentUser"
      :userInitials="userInitials"
      :roleLabel="roleLabel"
      :navItems="navItems"
      :reportItems="reportItems"
      :class="{ open: mobileNavOpen }"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
      @navigate="activeNav = $event; mobileNavOpen = false"
      @logout="handleLogout"
    />

    <!-- Main Content -->
    <main class="main-content">
      <!-- NavBar -->
      <NavBar
        :currentPageTitle="currentPageTitle"
        :today="today"
        :notifications="notifications"
        :posyanduList="posyanduList"
        :activeTab="activeTab"
        @navigate="setActiveTab"
        @toggle-mobile-nav="mobileNavOpen = !mobileNavOpen"
      />

      <!-- Dashboard Content -->
      <div class="content-area" v-if="activeNav === 'dashboard'">

        <!-- Page Title (mobile only) -->
        <div class="page-title-mobile">
          <h1>Dashboard</h1>
          <span class="date-mobile">{{ todayShort }}</span>
        </div>

        <!-- Error State -->
        <div class="fetch-error" v-if="fetchError">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="#E55353" stroke-width="1.5"/>
            <path d="M9 5v4M9 13h.01" stroke="#E55353" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>{{ fetchError }}</span>
          <button @click="fetchDashboardData">Coba lagi</button>
        </div>

        <!-- Stat Cards -->
        <div class="stats-grid">
          <div class="stat-card" v-for="stat in statCards" :key="stat.label"
            :style="{ '--accent': stat.color }"
            :class="{ 'is-loading': isLoading }">
            <div class="stat-icon" v-html="stat.icon"></div>
            <div class="stat-body">
              <span class="stat-value">{{ isLoading ? '…' : stat.value }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
            <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'" v-if="!isLoading && stat.trend !== 0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path :d="stat.trend > 0 ? 'M6 9V3M3 6l3-3 3 3' : 'M6 3v6M3 6l3 3 3-3'"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              {{ Math.abs(stat.trend) }}%
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="charts-row">
          <!-- Kunjungan Bulanan -->
          <div class="chart-card wide">
            <div class="card-header">
              <h3>Kunjungan Bulanan 2025</h3>
              <div class="chart-legend">
                <span class="legend-dot" style="background:#2F9D94"></span> Balita
                <span class="legend-dot" style="background:#025F67"></span> Bumil
                <span class="legend-dot" style="background:#BCC5CC"></span> Lansia
              </div>
            </div>
            <div class="bar-chart">
              <div class="bar-group" v-for="(m, i) in visibleMonthlyData" :key="i">
                <div class="bars">
                  <div class="bar balita" :style="{ height: (m.balita/maxVal*120)+'px' }"
                    :title="`Balita: ${m.balita}`"></div>
                  <div class="bar bumil" :style="{ height: (m.bumil/maxVal*120)+'px' }"
                    :title="`Bumil: ${m.bumil}`"></div>
                  <div class="bar lansia" :style="{ height: (m.lansia/maxVal*120)+'px' }"
                    :title="`Lansia: ${m.lansia}`"></div>
                </div>
                <span class="bar-label">{{ m.label }}</span>
              </div>
            </div>
          </div>

          <!-- Status Gizi Donut -->
          <div class="chart-card donut-card">
            <div class="card-header">
              <h3>Status Gizi Balita</h3>
              <span class="card-sub">Bulan ini</span>
            </div>
            <div class="donut-wrap">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="50" fill="none" stroke="#F7F6F2" stroke-width="20"/>
                <circle v-for="(seg, i) in donutSegments" :key="i"
                  cx="70" cy="70" r="50" fill="none"
                  :stroke="seg.color" stroke-width="20"
                  :stroke-dasharray="`${seg.dash} ${314 - seg.dash}`"
                  :stroke-dashoffset="seg.offset"
                  style="transform: rotate(-90deg); transform-origin: center;"/>
                <text x="70" y="66" text-anchor="middle" font-size="22" font-weight="600" fill="#063154">
                  {{ totalGizi }}
                </text>
                <text x="70" y="82" text-anchor="middle" font-size="10" fill="#BCC5CC">total</text>
              </svg>
              <div class="donut-legend">
                <div class="legend-row" v-for="seg in donutSegments" :key="seg.label">
                  <span class="legend-dot" :style="{ background: seg.color }"></span>
                  <span>{{ seg.label }}</span>
                  <span class="legend-val">{{ seg.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Posyandu Grid & Upcoming -->
        <div class="lower-row">
          <!-- 8 Posyandu Cards -->
          <div class="posyandu-section">
            <div class="section-header">
              <h3>Status 8 Posyandu</h3>
              <span class="see-all">Lihat Semua →</span>
            </div>
            <div class="posyandu-grid">
              <!-- Skeleton saat loading -->
              <template v-if="isLoading">
                <div class="posyandu-card skeleton-card" v-for="n in 8" :key="'sk-'+n"></div>
              </template>
              <!-- Data asli -->
              <template v-else>
                <div class="posyandu-card" v-for="p in posyanduStats" :key="p.nama">
                <div class="posyandu-card-top">
                  <div class="posyandu-num">{{ p.num }}</div>
                  <span class="posyandu-status" :class="p.status === 'Aktif' ? 'aktif' : 'libur'">
                    {{ p.status }}
                  </span>
                </div>
                <div class="posyandu-name">{{ p.nama }}</div>
                <div class="posyandu-ketua">{{ p.ketua }}</div>
                <div class="posyandu-stats">
                  <div class="pstat"><span>{{ p.balita }}</span><label>Balita</label></div>
                  <div class="pstat"><span>{{ p.bumil }}</span><label>Bumil</label></div>
                  <div class="pstat"><span>{{ p.lansia }}</span><label>Lansia</label></div>
                </div>
              </div>
              </template>
            </div>
          </div>
        </div>

      </div>

      <!-- DATA BALITA PAGE -->
      <div class="content-area" v-else-if="activeNav === 'balita'">
        <DataBalita
          :activePosyanduId="activeTab"
          :activePosyanduNama="posyanduList.find(p => p.id === activeTab)?.nama ?? ''"
          :posyanduKeyMap="posyanduKeyMap"
          :posyanduTableMap="posyanduTableMap"
        />
      </div>

      <!-- PLACEHOLDER PAGES (untuk halaman lain yang belum jadi) -->
      <div class="content-area placeholder-page" v-else>
        <div class="no-posyandu-selected"
          v-if="['bumil','lansia','imunisasi','kegiatan','stok'].includes(activeNav) && activeTab === null">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="#BCC5CC"/>
          </svg>
          <h2>Tidak Ada Data yang Akan Ditampilkan</h2>
          <p>Silahkan memilih posyandu dari tab di atas untuk melihat data</p>
        </div>
        <template v-else>
          <div class="placeholder-icon" v-html="currentNavIcon"></div>
          <h2>{{ currentPageTitle }}</h2>
          <p>Halaman ini sedang dalam pengembangan.</p>
        </template>
      </div>
    </main>

    <!-- Mobile Bottom Nav -->
    <nav class="mobile-bottom-nav">
      <button
        v-for="item in mobileNavItems"
        :key="item.id"
        class="mob-nav-btn"
        :class="{ active: activeNav === item.id }"
        @click="activeNav = item.id"
      >
        <span class="mob-nav-icon" v-html="item.icon"></span>
        <span class="mob-nav-label">{{ item.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { createClient } from '@supabase/supabase-js'
import NavBar from '../components/NavBar.vue'
import SideNavBar from '../components/SideNavBar.vue'
import DataBalita from './DataBalita.vue'
import { navItems, reportItems, allNav } from '../data/navigationData.js'
import '../assets/PageHome.css'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const POSYANDU_VAULT_KEYS = [
  'kacang_hijau', 'labu',
  'lobak', 'seledri',
  'singkil', 'terong',
  'tomat', 'wortel',
]

const POSYANDU_TABLES = [
  'balita_kacang_hijau',  'balita_labu',
  'balita_lobak',         'balita_seledri',
  'balita_singkil',       'balita_terong',
  'balita_tomat',         'balita_wortel',
]

const posyanduKeyMap   = ref({})
const posyanduTableMap = ref({})


// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────
const sidebarCollapsed = ref(false)
const activeNav        = ref('dashboard')
const activeTab        = ref(null)
const mobileNavOpen    = ref(false)

const currentUser = ref({
  nama: 'Admin Baqa',
  role: 'admin',
  posyandu_id: null,
})

const notifications = ref([
  { id: 1, msg: '3 jadwal kegiatan besok' },
  { id: 2, msg: 'Stok vitamin A hampir habis' },
])

// ──────────────────────────────────────────────
// Data (dummy – replace with Supabase queries)
// ──────────────────────────────────────────────
const today = computed(() =>
  new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
)

const todayShort = computed(() =>
  new Date().toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })
)

// posyanduList diisi dari Supabase saat fetchDashboardData()
const posyanduList = ref([])

// ──────────────────────────────────────────────
// Computed Properties
// ──────────────────────────────────────────────
const currentPageTitle = computed(() =>
  allNav.find(n => n.id === activeNav.value)?.label ?? 'Dashboard'
)
const currentNavIcon = computed(() =>
  allNav.find(n => n.id === activeNav.value)?.icon ?? ''
)

const userInitials = computed(() =>
  currentUser.value.nama.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
)

const roleLabel = computed(() => ({
  admin: 'Administrator',
  kader: 'Kader Posyandu',
  bidan: 'Bidan',
}[currentUser.value.role] ?? 'Pengguna'))

// Diisi dari Supabase — nilai awal '–' sebagai loading state
const statCards = ref([
  { label: 'Total Balita',       value: '–', icon: iconBalita(),   color: '#2F9D94', trend: 0 },
  { label: 'Ibu Hamil Aktif',    value: '–', icon: iconBumil(),    color: '#025F67', trend: 0 },
  { label: 'Lansia Terdaftar',   value: '–', icon: iconLansia(),   color: '#BCC5CC', trend: 0 },
  { label: 'Kegiatan Bulan Ini', value: '–', icon: iconKegiatan(), color: '#063154', trend: 0 },
])

const monthlyData = ref([
  { label:'Jan', balita:80,  bumil:15, lansia:60 },
  { label:'Feb', balita:92,  bumil:18, lansia:55 },
  { label:'Mar', balita:75,  bumil:12, lansia:70 },
  { label:'Apr', balita:110, bumil:20, lansia:65 },
  { label:'Mei', balita:98,  bumil:17, lansia:72 },
  { label:'Jun', balita:88,  bumil:14, lansia:68 },
  { label:'Jul', balita:120, bumil:22, lansia:80 },
  { label:'Agu', balita:105, bumil:19, lansia:75 },
  { label:'Sep', balita:95,  bumil:16, lansia:70 },
  { label:'Okt', balita:112, bumil:21, lansia:82 },
  { label:'Nov', balita:88,  bumil:13, lansia:65 },
  { label:'Des', balita:100, bumil:18, lansia:74 },
])

// On small screens, show only last 6 months to avoid overflow
const visibleMonthlyData = computed(() => {
  if (typeof window !== 'undefined' && window.innerWidth < 640) {
    return monthlyData.value.slice(6)
  }
  return monthlyData.value
})

const maxVal = computed(() =>
  Math.max(...monthlyData.value.map(m => Math.max(m.balita, m.bumil, m.lansia)))
)

const giziData = [
  { label: 'Gizi Baik',   count: 198, color: '#2F9D94' },
  { label: 'Gizi Kurang', count: 32,  color: '#F7C94E' },
  { label: 'Gizi Buruk',  count: 8,   color: '#E55353' },
  { label: 'Gizi Lebih',  count: 10,  color: '#025F67' },
]
const totalGizi = computed(() => giziData.reduce((a, b) => a + b.count, 0))
const donutSegments = computed(() => {
  const total = totalGizi.value
  const circumference = 314
  let offset = 0
  return giziData.map(g => {
    const dash = (g.count / total) * circumference
    const seg = { ...g, dash, offset: -offset }
    offset += dash
    return seg
  })
})

// Diisi dari v_ringkasan_posyandu
const posyanduStats = ref([])

// Mobile bottom nav shortcuts
const mobileNavItems = computed(() =>
  (allNav ?? navItems ?? []).slice(0, 5)
)

// ──────────────────────────────────────────────
// Loading & Error State
// ──────────────────────────────────────────────
const isLoading = ref(true)
const fetchError = ref(null)

// ──────────────────────────────────────────────
// Supabase fetch
// ──────────────────────────────────────────────
async function fetchDashboardData() {
  isLoading.value  = true
  fetchError.value = null

  try {
    // ── 1. Total Balita dari v_semua_balita ──────
    const { count: totalBalitaCount, error: errBalita } = await supabase
      .from('v_semua_balita')
      .select('*', { count: 'exact', head: true })

    if (errBalita) throw errBalita

    // ── 2. Ringkasan per posyandu dari view ──────
    const { data: ringkasan, error: errRingkasan } = await supabase
      .from('v_ringkasan_posyandu')
      .select('id, nama, ketua, total_bumil, total_lansia, kegiatan_terjadwal')
      .order('nama')

    if (errRingkasan) throw errRingkasan

    // ── 3. Hitung total balita per posyandu dari tabel individual ──
    const table_mappings = [
      'balita_kacang_hijau', 'balita_labu',
      'balita_lobak', 'balita_seledri',
      'balita_singkil', 'balita_terong',
      'balita_tomat', 'balita_wortel'
    ]
    const posyandu_names = [
      'Posyandu Kacang Hijau', 'Posyandu Labu',
      'Posyandu Lobak', 'Posyandu Seledri',
      'Posyandu Singkil', 'Posyandu Terong',
      'Posyandu Tomat', 'Posyandu Wortel'
    ]

    const balitaCounts = {}
    for (let i = 0; i < table_mappings.length; i++) {
      const { count, error } = await supabase
        .from(table_mappings[i])
        .select('*', { count: 'exact', head: true })
      if (!error) {
        balitaCounts[posyandu_names[i]] = count || 0
      }
    }

    // Isi posyanduStats dengan data dari ringkasan + balita counts
    posyanduStats.value = ringkasan.map((p, i) => {
      const posyanduName = p.nama
      return {
        num:    String(i + 1).padStart(2, '0'),
        id:     p.id,
        nama:   p.nama.replace('Posyandu ', ''),
        ketua:  p.ketua ?? '–',
        status: 'Aktif',
        balita: balitaCounts[posyanduName] ?? 0,
        bumil:  p.total_bumil   ?? 0,
        lansia: p.total_lansia  ?? 0,
      }
    })

    // Isi posyanduList untuk NavBar dropdown
    posyanduList.value = ringkasan.map(p => ({ id: p.id, nama: p.nama }))

    // Bangun mapping sesuai urutan hasil query (order by nama = urutan abjad)
    // Urutan: Kacang Hijau, Labu, Lobak, Seledri, Singkil, Terong, Tomat, Wortel
    const newKeyMap   = {}
    const newTableMap = {}
    ringkasan.forEach((p, i) => {
      newKeyMap[p.id]   = POSYANDU_VAULT_KEYS[i]
      newTableMap[p.id] = POSYANDU_TABLES[i]
    })
    posyanduKeyMap.value   = newKeyMap
    posyanduTableMap.value = newTableMap

    // ── 4. Total lintas posyandu untuk stat cards ─
    const totalBumil    = ringkasan.reduce((sum, p) => sum + (p.total_bumil   ?? 0), 0)
    const totalLansia   = ringkasan.reduce((sum, p) => sum + (p.total_lansia  ?? 0), 0)
    const totalKegiatan = ringkasan.reduce((sum, p) => sum + (p.kegiatan_terjadwal ?? 0), 0)

    statCards.value = [
      { label: 'Total Balita',       value: String(totalBalitaCount ?? 0), icon: iconBalita(),   color: '#2F9D94', trend: 0 },
      { label: 'Ibu Hamil Aktif',    value: String(totalBumil),            icon: iconBumil(),    color: '#025F67', trend: 0 },
      { label: 'Lansia Terdaftar',   value: String(totalLansia),           icon: iconLansia(),   color: '#BCC5CC', trend: 0 },
      { label: 'Kegiatan Terjadwal', value: String(totalKegiatan),         icon: iconKegiatan(), color: '#063154', trend: 0 },
    ]

  } catch (err) {
    console.error('[fetchDashboardData]', err)
    fetchError.value = err.message ?? 'Gagal memuat data dashboard.'
  } finally {
    isLoading.value = false
  }
}

fetchDashboardData()

// ──────────────────────────────────────────────
// Navigation
// ──────────────────────────────────────────────
function setActiveTab(posyanduId) {
  activeTab.value = posyanduId
}

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────
async function handleLogout() {
  await supabase.auth.signOut()
  window.location.href = '/login'
}

// ──────────────────────────────────────────────
// Icon helpers
// ──────────────────────────────────────────────
function iconBalita() {
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/>
    <path d="M3 21c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`
}
function iconBumil() {
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="6" r="3.5" stroke="currentColor" stroke-width="1.5"/>
    <path d="M6 12c0 4 2.5 8 5 8s5-4 5-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`
}
function iconLansia() {
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="6" r="3.5" stroke="currentColor" stroke-width="1.5"/>
    <path d="M5 21v-4a6 6 0 0112 0v4M11 13v5M9 16h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`
}
function iconKegiatan() {
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="2" y="4" width="18" height="16" rx="2.5" stroke="currentColor" stroke-width="1.5"/>
    <path d="M2 9h18M7 2v4M15 2v4M7 13h8M7 17h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`
}
</script>
