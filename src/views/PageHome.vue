<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo-wrap">
          <div class="logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#2F9D94"/>
              <path d="M14 6v16M6 14h16" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="14" cy="14" r="4" fill="#063154" opacity="0.5"/>
            </svg>
          </div>
          <div v-if="!sidebarCollapsed" class="logo-text">
            <span class="logo-name">SiBaqaSehat</span>
            <span class="logo-sub">Kel. Baqa, Samarinda</span>
          </div>
        </div>
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path :d="sidebarCollapsed ? 'M6 3l5 5-5 5' : 'M10 3L5 8l5 5'"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-group">
          <span v-if="!sidebarCollapsed" class="nav-label">Menu Utama</span>
          <a
            v-for="item in navItems"
            :key="item.id"
            class="nav-item"
            :class="{ active: activeNav === item.id }"
            @click="activeNav = item.id"
          >
            <span class="nav-icon" v-html="item.icon"></span>
            <span v-if="!sidebarCollapsed" class="nav-text">{{ item.label }}</span>
            <span v-if="!sidebarCollapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
          </a>
        </div>

        <div class="nav-group">
          <span v-if="!sidebarCollapsed" class="nav-label">Laporan</span>
          <a
            v-for="item in reportItems"
            :key="item.id"
            class="nav-item"
            :class="{ active: activeNav === item.id }"
            @click="activeNav = item.id"
          >
            <span class="nav-icon" v-html="item.icon"></span>
            <span v-if="!sidebarCollapsed" class="nav-text">{{ item.label }}</span>
          </a>
        </div>
      </nav>

      <div class="sidebar-footer" v-if="!sidebarCollapsed">
        <div class="user-card">
          <div class="user-avatar">{{ userInitials }}</div>
          <div class="user-info">
            <span class="user-name">{{ currentUser.nama }}</span>
            <span class="user-role">{{ roleLabel }}</span>
          </div>
          <button class="logout-btn" @click="handleLogout" title="Keluar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="page-title">{{ currentPageTitle }}</h1>
          <span class="breadcrumb">Kelurahan Baqa &rsaquo; {{ currentPageTitle }}</span>
        </div>
        <div class="topbar-right">
          <div class="date-badge">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" stroke-width="1.2"/>
              <path d="M1 5.5h12M4.5 1v2M9.5 1v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
            {{ today }}
          </div>
          <div class="notif-btn" @click="showNotif = !showNotif">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2a5.5 5.5 0 00-5.5 5.5v3L2 12v1h14v-1l-1.5-1.5v-3A5.5 5.5 0 009 2z"
                stroke="currentColor" stroke-width="1.4"/>
              <path d="M7 13a2 2 0 004 0" stroke="currentColor" stroke-width="1.4"/>
            </svg>
            <span class="notif-dot" v-if="notifications.length"></span>
          </div>
          <select class="posyandu-filter" v-model="selectedPosyandu">
            <option value="all">Semua Posyandu</option>
            <option v-for="p in posyanduList" :key="p.id" :value="p.id">{{ p.nama }}</option>
          </select>
        </div>
      </header>

      <!-- Dashboard Content -->
      <div class="content-area" v-if="activeNav === 'dashboard'">

        <!-- Stat Cards -->
        <div class="stats-grid">
          <div class="stat-card" v-for="stat in statCards" :key="stat.label"
            :style="{ '--accent': stat.color }">
            <div class="stat-icon" v-html="stat.icon"></div>
            <div class="stat-body">
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
            <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
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
              <div class="bar-group" v-for="(m, i) in monthlyData" :key="i">
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
          <div class="chart-card">
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
            </div>
          </div>

          <!-- Jadwal Kegiatan -->
          <div class="schedule-section">
            <div class="section-header">
              <h3>Kegiatan Mendatang</h3>
            </div>
            <div class="schedule-list">
              <div class="schedule-item" v-for="(evt, i) in upcomingEvents" :key="i">
                <div class="schedule-date">
                  <span class="sch-day">{{ evt.day }}</span>
                  <span class="sch-mon">{{ evt.month }}</span>
                </div>
                <div class="schedule-info">
                  <span class="sch-title">{{ evt.title }}</span>
                  <span class="sch-posyandu">{{ evt.posyandu }}</span>
                </div>
                <span class="sch-badge" :class="evt.type">{{ evt.typeLabel }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Placeholder pages -->
      <div class="content-area placeholder-page" v-else>
        <div class="placeholder-icon" v-html="currentNavIcon"></div>
        <h2>{{ currentPageTitle }}</h2>
        <p>Halaman ini sedang dalam pengembangan.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────
const sidebarCollapsed = ref(false)
const activeNav        = ref('dashboard')
const selectedPosyandu = ref('all')
const showNotif        = ref(false)

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
// Navigation
// ──────────────────────────────────────────────
const navItems = [
  {
    id: 'dashboard', label: 'Dashboard',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
      <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
      <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
      <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
    </svg>`
  },
  {
    id: 'balita', label: 'Data Balita', badge: '248',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="6" r="3.5" stroke="currentColor" stroke-width="1.4"/>
      <path d="M2 16c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'bumil', label: 'Ibu Hamil',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="5" r="3" stroke="currentColor" stroke-width="1.4"/>
      <path d="M5 10c0 3 1.5 6 4 6s4-3 4-6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'lansia', label: 'Lansia',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="5" r="3" stroke="currentColor" stroke-width="1.4"/>
      <path d="M4 17v-3a5 5 0 0110 0v3M9 11v4M7 13h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'imunisasi', label: 'Imunisasi',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M11 3l4 4-8 8-4-4 8-8zM9 5l4 4M2 16l2-2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 'kegiatan', label: 'Kegiatan',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" stroke-width="1.4"/>
      <path d="M2 7h14M6 1v4M12 1v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'stok', label: 'Stok & Obat',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="4" y="2" width="10" height="14" rx="2" stroke="currentColor" stroke-width="1.4"/>
      <path d="M7 6h4M7 9h4M7 12h2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`
  },
]

const reportItems = [
  {
    id: 'laporan_bulanan', label: 'Laporan Bulanan',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 14V5l6-3 6 3v9l-6 3-6-3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M9 2v12M3 5l6 3 6-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'pengaturan', label: 'Pengaturan',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" stroke-width="1.4"/>
      <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.2 3.2l1.4 1.4M13.4 13.4l1.4 1.4M3.2 14.8l1.4-1.4M13.4 4.6l1.4-1.4"
        stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`
  },
]

const allNav = [...navItems, ...reportItems]

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

// ──────────────────────────────────────────────
// Data (dummy – replace with Supabase queries)
// ──────────────────────────────────────────────
const today = computed(() =>
  new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
)

const posyanduList = ref([
  { id: '1', nama: 'Posyandu Melati I' },
  { id: '2', nama: 'Posyandu Melati II' },
  { id: '3', nama: 'Posyandu Anggrek I' },
  { id: '4', nama: 'Posyandu Anggrek II' },
  { id: '5', nama: 'Posyandu Mawar I' },
  { id: '6', nama: 'Posyandu Mawar II' },
  { id: '7', nama: 'Posyandu Kenanga I' },
  { id: '8', nama: 'Posyandu Kenanga II' },
])

const statCards = ref([
  { label: 'Total Balita',    value: '248', icon: iconBalita(),   color: '#2F9D94', trend:  5 },
  { label: 'Ibu Hamil Aktif', value: '43',  icon: iconBumil(),    color: '#025F67', trend:  2 },
  { label: 'Lansia Terdaftar',value: '187', icon: iconLansia(),   color: '#BCC5CC', trend: -1 },
  { label: 'Kegiatan Bulan Ini', value: '24', icon: iconKegiatan(), color: '#063154', trend:  8 },
])

const monthlyData = ref([
  { label:'Jan', balita:80, bumil:15, lansia:60 },
  { label:'Feb', balita:92, bumil:18, lansia:55 },
  { label:'Mar', balita:75, bumil:12, lansia:70 },
  { label:'Apr', balita:110,bumil:20, lansia:65 },
  { label:'Mei', balita:98, bumil:17, lansia:72 },
  { label:'Jun', balita:88, bumil:14, lansia:68 },
  { label:'Jul', balita:120,bumil:22, lansia:80 },
  { label:'Agu', balita:105,bumil:19, lansia:75 },
  { label:'Sep', balita:95, bumil:16, lansia:70 },
  { label:'Okt', balita:112,bumil:21, lansia:82 },
  { label:'Nov', balita:88, bumil:13, lansia:65 },
  { label:'Des', balita:100,bumil:18, lansia:74 },
])
const maxVal = computed(() => Math.max(...monthlyData.value.map(m => Math.max(m.balita, m.bumil, m.lansia))))

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

const posyanduStats = ref([
  { num:'01', nama:'Melati I',    ketua:'Siti Rahayu',   status:'Aktif', balita:32, bumil:6, lansia:24 },
  { num:'02', nama:'Melati II',   ketua:'Dewi Kartika',  status:'Aktif', balita:28, bumil:4, lansia:21 },
  { num:'03', nama:'Anggrek I',   ketua:'Fatimah Zahra', status:'Aktif', balita:35, bumil:7, lansia:28 },
  { num:'04', nama:'Anggrek II',  ketua:'Nurul Aini',    status:'Libur', balita:30, bumil:5, lansia:22 },
  { num:'05', nama:'Mawar I',     ketua:'Sri Wahyuni',   status:'Aktif', balita:27, bumil:6, lansia:20 },
  { num:'06', nama:'Mawar II',    ketua:'Hana Pertiwi',  status:'Aktif', balita:40, bumil:8, lansia:35 },
  { num:'07', nama:'Kenanga I',   ketua:'Rina Astuti',   status:'Aktif', balita:33, bumil:4, lansia:27 },
  { num:'08', nama:'Kenanga II',  ketua:'Yuliana Sari',  status:'Aktif', balita:23, bumil:3, lansia:20 },
])

const upcomingEvents = ref([
  { day:'07', month:'Jul', title:'Penimbangan Balita', posyandu:'Melati I', type:'timbang', typeLabel:'Timbang' },
  { day:'08', month:'Jul', title:'Imunisasi DPT Booster', posyandu:'Anggrek II', type:'imun', typeLabel:'Imunisasi' },
  { day:'09', month:'Jul', title:'Pemeriksaan Lansia', posyandu:'Mawar I', type:'lansia', typeLabel:'Lansia' },
  { day:'10', month:'Jul', title:'Pemeriksaan Bumil', posyandu:'Kenanga I', type:'bumil', typeLabel:'Bumil' },
  { day:'12', month:'Jul', title:'Penimbangan Balita', posyandu:'Melati II', type:'timbang', typeLabel:'Timbang' },
])

// ──────────────────────────────────────────────
// Supabase fetch (aktifkan saat sudah tersambung)
// ──────────────────────────────────────────────
async function fetchDashboardData() {
  // Contoh query ringkasan
  const { data, error } = await supabase
    .from('v_ringkasan_posyandu')
    .select('*')
  if (!error && data) {
    // Map data ke posyanduStats
    posyanduStats.value = data.map((p, i) => ({
      num: String(i + 1).padStart(2, '0'),
      nama: p.nama.replace('Posyandu ', ''),
      ketua: p.ketua,
      status: 'Aktif',
      balita: p.total_balita,
      bumil: p.total_bumil,
      lansia: p.total_lansia,
    }))
  }
}

fetchDashboardData() // Aktifkan baris ini saat Supabase siap

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

<style scoped>
/* ──────────────────────────────────────────────
   CSS Variables – Color Palette SiBaqaSehat
   ────────────────────────────────────────────── */
:root {
  --scooter:    #2F9D94;
  --alabaster:  #F7F6F2;
  --heather:    #BCC5CC;
  --bluelagoon: #025F67;
  --sapphire:   #063154;
  --white:      #ffffff;
  --text-dark:  #063154;
  --text-muted: #6B7B8A;
  --border:     #E2E8ED;
  --sidebar-w:  240px;
  --sidebar-collapsed: 68px;
  --topbar-h:   64px;
}

/* ──────────────────────────────────────────────
   Layout
   ────────────────────────────────────────────── */
.dashboard {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--alabaster);
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: var(--text-dark);
}

/* ──────────────────────────────────────────────
   Sidebar
   ────────────────────────────────────────────── */
.sidebar {
  width: var(--sidebar-w);
  min-width: var(--sidebar-w);
  background: var(--sapphire);
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease, min-width 0.25s ease;
  overflow: hidden;
  position: relative;
  z-index: 10;
}
.sidebar.collapsed {
  width: var(--sidebar-collapsed);
  min-width: var(--sidebar-collapsed);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.logo-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
}
.logo-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.logo-name {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}
.logo-sub {
  font-size: 10px;
  color: var(--heather);
  white-space: nowrap;
}
.collapse-btn {
  background: none;
  border: none;
  color: var(--heather);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  flex-shrink: 0;
  transition: background 0.15s;
}
.collapse-btn:hover { background: rgba(255,255,255,0.1); }

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  overflow-y: auto;
  overflow-x: hidden;
}
.nav-group { margin-bottom: 24px; }
.nav-label {
  display: block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--heather);
  opacity: 0.6;
  padding: 0 8px 6px;
  white-space: nowrap;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  cursor: pointer;
  color: rgba(255,255,255,0.65);
  font-size: 13px;
  transition: all 0.15s;
  white-space: nowrap;
  text-decoration: none;
  position: relative;
}
.nav-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
.nav-item.active {
  background: var(--scooter);
  color: #fff;
}
.nav-icon { flex-shrink: 0; display: flex; align-items: center; }
.nav-text { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.nav-badge {
  background: var(--scooter);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 20px;
  flex-shrink: 0;
}
.nav-item.active .nav-badge { background: rgba(255,255,255,0.25); }

.sidebar-footer {
  padding: 12px 10px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255,255,255,0.06);
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--scooter);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.user-name {
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-role {
  font-size: 10px;
  color: var(--heather);
}
.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--heather);
  padding: 4px;
  border-radius: 4px;
  transition: color 0.15s;
}
.logout-btn:hover { color: #fff; }

/* ──────────────────────────────────────────────
   Main Content
   ────────────────────────────────────────────── */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Topbar */
.topbar {
  height: var(--topbar-h);
  background: var(--scooter);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  gap: 16px;
  flex-shrink: 0;
}
.topbar-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}
.breadcrumb {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.date-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.notif-btn {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: background 0.15s;
}
.notif-btn:hover { background: rgba(255, 255, 255, 0.2); }
.notif-dot {
  position: absolute;
  top: 6px; right: 6px;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #E55353;
  border: 2px solid var(--scooter);
}
.posyandu-filter {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 12px;
  color: var(--sapphire);
  background: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  outline: none;
}
.posyandu-filter:focus { border-color: rgba(255, 255, 255, 0.5); }

/* Content Area */
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ──────────────────────────────────────────────
   Stat Cards
   ────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.stat-card {
  background: var(--white);
  border-radius: 14px;
  border: 1px solid var(--border);
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.stat-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: var(--accent);
  border-radius: 4px 0 0 4px;
}
.stat-card:hover { box-shadow: 0 4px 16px rgba(2,95,103,0.08); }
.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--accent) 10%, var(--alabaster));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
}
.stat-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stat-value {
  font-size: 26px;
  font-weight: 800;
  color: var(--sapphire);
  line-height: 1;
}
.stat-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}
.stat-trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  flex-shrink: 0;
}
.stat-trend.up   { background: #EAFAF4; color: #16A87A; }
.stat-trend.down { background: #FEF0F0; color: #E55353; }

/* ──────────────────────────────────────────────
   Charts Row
   ────────────────────────────────────────────── */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
}
.chart-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.card-header h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--sapphire);
  margin: 0;
}
.card-sub { font-size: 11px; color: var(--text-muted); }
.chart-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: var(--text-muted);
}
.legend-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* Bar Chart */
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 140px;
  padding-bottom: 20px;
  position: relative;
}
.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}
.bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 120px;
}
.bar {
  width: 10px;
  border-radius: 3px 3px 0 0;
  transition: height 0.4s ease;
  cursor: pointer;
}
.bar.balita { background: var(--scooter); }
.bar.bumil  { background: var(--bluelagoon); }
.bar.lansia { background: var(--heather); }
.bar-label {
  font-size: 9px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* Donut */
.donut-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
}
.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
.legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-dark);
}
.legend-row .legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.legend-val {
  margin-left: auto;
  font-weight: 700;
  font-size: 13px;
  color: var(--sapphire);
}

/* ──────────────────────────────────────────────
   Lower Row
   ────────────────────────────────────────────── */
.lower-row {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 16px;
}

/* Posyandu Section */
.posyandu-section, .schedule-section {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.section-header h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--sapphire);
  margin: 0;
}
.see-all {
  font-size: 12px;
  color: var(--scooter);
  cursor: pointer;
  font-weight: 600;
}
.posyandu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.posyandu-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.posyandu-card:hover {
  border-color: var(--scooter);
  box-shadow: 0 2px 8px rgba(47,157,148,0.1);
}
.posyandu-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.posyandu-num {
  font-size: 20px;
  font-weight: 800;
  color: var(--scooter);
  line-height: 1;
}
.posyandu-status {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.posyandu-status.aktif { background: #EAFAF4; color: #16A87A; }
.posyandu-status.libur { background: #FEF0F0; color: #E55353; }
.posyandu-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--sapphire);
  margin-bottom: 2px;
}
.posyandu-ketua {
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 10px;
}
.posyandu-stats {
  display: flex;
  gap: 0;
  border-top: 1px solid var(--border);
  padding-top: 10px;
}
.pstat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.pstat span {
  font-size: 16px;
  font-weight: 800;
  color: var(--bluelagoon);
}
.pstat label {
  font-size: 9px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Schedule */
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.schedule-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  transition: border-color 0.15s;
}
.schedule-item:hover { border-color: var(--scooter); }
.schedule-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 36px;
  flex-shrink: 0;
  background: var(--sapphire);
  border-radius: 6px;
  padding: 4px 0;
}
.sch-day {
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}
.sch-mon {
  font-size: 9px;
  color: var(--heather);
  text-transform: uppercase;
}
.schedule-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}
.sch-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--sapphire);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sch-posyandu {
  font-size: 10px;
  color: var(--text-muted);
}
.sch-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 20px;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.sch-badge.timbang { background: #E6F7F6; color: var(--scooter); }
.sch-badge.imun    { background: #EEF0FF; color: #5C6BC0; }
.sch-badge.lansia  { background: #F0F4F8; color: var(--bluelagoon); }
.sch-badge.bumil   { background: #FFF8E6; color: #F59E0B; }

/* ──────────────────────────────────────────────
   Placeholder Page
   ────────────────────────────────────────────── */
.placeholder-page {
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  color: var(--text-muted);
}
.placeholder-icon { opacity: 0.3; transform: scale(2); }
.placeholder-page h2 { font-size: 20px; color: var(--sapphire); margin: 0; }
.placeholder-page p  { font-size: 13px; }

/* ──────────────────────────────────────────────
   Responsive
   ────────────────────────────────────────────── */
@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .posyandu-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .charts-row  { grid-template-columns: 1fr; }
  .lower-row   { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .stats-grid  { grid-template-columns: 1fr; }
  .topbar-right .date-badge { display: none; }
}
</style>
