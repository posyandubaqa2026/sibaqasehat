<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <SideNavBar
      :collapsed="sidebarCollapsed"
      :activeNav="activeNav"
      :currentUser="currentUser"
      :userInitials="userInitials"
      :roleLabel="roleLabel"
      :navItems="navItems"
      :reportItems="reportItems"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
      @navigate="activeNav = $event"
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
      />

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
import NavBar from '../components/NavBar.vue'
import SideNavBar from '../components/SideNavBar.vue'
import { navItems, reportItems, allNav } from '../data/navigationData.js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────
const sidebarCollapsed = ref(false)
const activeNav        = ref('dashboard')
const activeTab        = ref(null)

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
  --NavBar-h:   64px;
}

/* ──────────────────────────────────────────────
   Layout
   ────────────────────────────────────────────── */
.dashboard {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #F7F6F2;
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: #063154;
}

/* ──────────────────────────────────────────────
   Main Content
   ────────────────────────────────────────────── */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}


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
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #E2E8ED;
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
  background: color-mix(in srgb, var(--accent) 10%, #F7F6F2);
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
  color: #063154;
  line-height: 1;
}
.stat-label {
  font-size: 11px;
  color: #6B7B8A;
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
  background: #ffffff;
  border: 1px solid #E2E8ED;
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
  color: #063154;
  margin: 0;
}
.card-sub { font-size: 11px; color: #6B7B8A; }
.chart-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: #6B7B8A;
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
.bar.balita { background: #2F9D94; }
.bar.bumil  { background: #025F67; }
.bar.lansia { background: #BCC5CC; }
.bar-label {
  font-size: 9px;
  color: #6B7B8A;
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
  color: #063154;
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
  color: #063154;
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
  background: #ffffff;
  border: 1px solid #E2E8ED;
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
  color: #063154;
  margin: 0;
}
.see-all {
  font-size: 12px;
  color: #2F9D94;
  cursor: pointer;
  font-weight: 600;
}
.posyandu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.posyandu-card {
  border: 1px solid #E2E8ED;
  border-radius: 10px;
  padding: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.posyandu-card:hover {
  border-color: #2F9D94;
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
  color: #2F9D94;
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
  color: #063154;
  margin-bottom: 2px;
}
.posyandu-ketua {
  font-size: 10px;
  color: #6B7B8A;
  margin-bottom: 10px;
}
.posyandu-stats {
  display: flex;
  gap: 0;
  border-top: 1px solid #E2E8ED;
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
  color: #025F67;
}
.pstat label {
  font-size: 9px;
  color: #6B7B8A;
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
  border: 1px solid #E2E8ED;
  transition: border-color 0.15s;
}
.schedule-item:hover { border-color: #2F9D94; }
.schedule-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 36px;
  flex-shrink: 0;
  background: #063154;
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
  color: #BCC5CC;
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
  color: #063154;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sch-posyandu {
  font-size: 10px;
  color: #6B7B8A;
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
.sch-badge.timbang { background: #E6F7F6; color: #2F9D94; }
.sch-badge.imun    { background: #EEF0FF; color: #5C6BC0; }
.sch-badge.lansia  { background: #F0F4F8; color: #025F67; }
.sch-badge.bumil   { background: #FFF8E6; color: #F59E0B; }

/* ──────────────────────────────────────────────
   Placeholder Page
   ────────────────────────────────────────────── */
.placeholder-page {
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  color: #6B7B8A;
}
.placeholder-icon { opacity: 0.3; transform: scale(2); }
.placeholder-page h2 { font-size: 20px; color: #063154; margin: 0; }
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
  .NavBar-right .date-badge { display: none; }
}
</style>
