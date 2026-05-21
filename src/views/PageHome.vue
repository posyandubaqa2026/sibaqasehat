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
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
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
              <h3>Kunjungan Bulanan {{ currentYear }}</h3>
              <div class="chart-legend">
                <span class="legend-dot" style="background:#2F9D94"></span> Balita
              </div>
            </div>

            <div class="bar-chart">
              <div class="bar-group" v-for="(m, i) in visibleMonthlyData" :key="i">
                <div class="bars single-bar">
                  <span class="bar-value">{{ m.balita }}</span>
                  <div
                    class="bar balita"
                    :style="{ '--bar-scale': barScale(m.balita) }"
                    :title="`Balita: ${m.balita}`"
                  ></div>
                </div>
                <span class="bar-label">{{ m.label }}</span>
              </div>
            </div>
          </div>

          <!-- Status Gizi Donut -->
          <div class="chart-card donut-card">
            <div class="card-header">
              <h3>Status Gizi Balita</h3>
              <span class="card-sub">{{ selectedMonthLabel }}</span>
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
                <div class="legend-row" v-for="seg in giziData" :key="seg.label">
                  <span class="legend-dot" :style="{ background: seg.color }"></span>
                  <span>{{ seg.label }}</span>
                  <span class="legend-val">{{ seg.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Posyandu Grid -->
        <div class="lower-row">
          <div class="posyandu-section">
            <div class="section-header">
              <h3>Status 8 Posyandu</h3>
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

                  <div class="posyandu-stats">
                    <div class="pstat">
                      <span>{{ p.balita }}</span>
                      <label>Balita</label>
                    </div>
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

      <!-- HASIL PENIMBANGAN PAGE -->
      <div class="content-area" v-else-if="activeNav === 'penimbangan'">
        <HasilPenimbangan
          :activePosyanduId="activeTab"
          :activePosyanduNama="posyanduList.find(p => p.id === activeTab)?.nama ?? ''"
          :posyanduKeyMap="posyanduKeyMap"
          :posyanduTableMap="posyanduTableMap"
        />
      </div>

      <!-- KLASIFIKASI BALITA PAGE -->
      <div class="content-area" v-else-if="activeNav === 'klasifikasi'">
        <KlasifikasiBalita
          :activePosyanduId="activeTab"
          :activePosyanduNama="posyanduList.find(p => p.id === activeTab)?.nama ?? ''"
          :posyanduKeyMap="posyanduKeyMap"
          :posyanduTableMap="posyanduTableMap"
        />
      </div>

      <!-- LAPORAN BULANAN PAGE -->
      <div class="content-area" v-else-if="activeNav === 'laporan_bulanan'">
        <LaporanBulanan
          :activePosyanduId="activeTab"
          :activePosyanduNama="posyanduList.find(p => p.id === activeTab)?.nama ?? ''"
          :posyanduKeyMap="posyanduKeyMap"
          :posyanduTableMap="posyanduTableMap"
        />
      </div>

      <!-- PLACEHOLDER PAGES -->
      <div class="content-area placeholder-page" v-else>
        <div class="no-posyandu-selected"
          v-if="['bumil','imunisasi','kegiatan','stok'].includes(activeNav) && activeTab === null">
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
        type="button"
        class="mob-nav-btn"
        :class="{ active: activeNav === item.id }"
        :aria-label="`Buka ${item.label}`"
        :aria-current="activeNav === item.id ? 'page' : undefined"
        @click="setActiveNav(item.id)"
      >
        <span class="mob-nav-icon" aria-hidden="true" v-html="item.icon"></span>
        <span class="mob-nav-label">{{ item.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import NavBar from '../components/NavBar.vue'
import SideNavBar from '../components/SideNavBar.vue'

const DataBalita = defineAsyncComponent(() => import('./DataBalita.vue'))
const HasilPenimbangan = defineAsyncComponent(() => import('./HasilPenimbangan.vue'))
const KlasifikasiBalita = defineAsyncComponent(() => import('./KlasifikasiBalita.vue'))
const LaporanBulanan = defineAsyncComponent(() => import('./LaporanBulanan.vue'))

import { navItems, reportItems, allNav } from '../data/navigationData.js'
import '../assets/PageHome.css'

import { calcAgeMonthsAtDate, classifyWeightAge, createEmptyDashboardGiziCounts, formatMonthLabel, getCurrentMonthKey, getMonthRangeFromKey, mergeDashboardGiziCounts, normalizeDashboardGiziLabel, toNumberOrNull,} from '../utils/WHOWeightAge'

let supabaseClient = null

async function getSupabase() {
  if (!supabaseClient) {
    const mod = await import('../lib/supabase')
    supabaseClient = mod.supabase
  }

  return supabaseClient
}

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────
const POSYANDU_VAULT_KEYS = [
  'kacang_hijau', 'labu',
  'lobak',        'seledri',
  'singkil',      'terong',
  'tomat',        'wortel',
]

const POSYANDU_TABLES = [
  'balita_kacang_hijau', 'balita_labu',
  'balita_lobak',        'balita_seledri',
  'balita_singkil',      'balita_terong',
  'balita_tomat',        'balita_wortel',
]

const PENIMBANGAN_TABLES = [
  'hasil_penimbangan_kacang_hijau', 'hasil_penimbangan_labu',
  'hasil_penimbangan_lobak',        'hasil_penimbangan_seledri',
  'hasil_penimbangan_singkil',      'hasil_penimbangan_terong',
  'hasil_penimbangan_tomat',        'hasil_penimbangan_wortel',
]

const POSYANDU_NAMES = [
  'Posyandu Kacang Hijau', 'Posyandu Labu',
  'Posyandu Lobak',        'Posyandu Seledri',
  'Posyandu Singkil',      'Posyandu Terong',
  'Posyandu Tomat',        'Posyandu Wortel',
]

const posyanduKeyMap   = ref({})
const posyanduTableMap = ref({})

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────
const sidebarCollapsed = ref(false)
const activeNav        = ref('dashboard')
// null = tab "Dashboard" → tampilkan TOTAL semua posyandu
// id   = tab posyandu tertentu → tampilkan data posyandu itu saja
const activeTab        = ref(null)
const mobileNavOpen    = ref(false)

const currentUser = ref({
  nama: 'Admin Baqa',
  role: 'admin',
  posyandu_id: null,
})

// ──────────────────────────────────────────────
// Date helpers
// ──────────────────────────────────────────────
const today = computed(() =>
  new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
)
const todayShort = computed(() =>
  new Date().toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })
)

const currentYear = computed(() => new Date().getFullYear())

const posyanduList = ref([])

// ──────────────────────────────────────────────
// Computed
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

// ──────────────────────────────────────────────
// Data: totals & per-posyandu stats
// ──────────────────────────────────────────────

// Grand totals (dipakai saat tab Dashboard / activeTab === null)
const totalBalitaAll      = ref(0)
const totalPenimbanganAll = ref(0)

// Per-posyandu stats — masing-masing item punya field `penimbangan`
const posyanduStats = ref([])

// ──────────────────────────────────────────────
// Stat Cards
// Reaktif terhadap activeTab:
//   null → total semua posyandu
//   id   → data posyandu yang dipilih
// ──────────────────────────────────────────────
const statCards = computed(() => {
  if (isLoading.value) {
    return [
      { label: 'Total Balita',                value: '…', icon: iconBalita(),      color: '#2F9D94', trend: 0 },
      { label: 'Total Penimbangan Bulan Ini', value: '…', icon: iconPenimbangan(), color: '#063154', trend: 0 },
    ]
  }

  // Tab "Dashboard" → tampilkan total semua posyandu
  if (activeTab.value === null) {
    return [
      { label: 'Total Balita',                value: String(totalBalitaAll.value),      icon: iconBalita(),      color: '#2F9D94', trend: 0 },
      { label: 'Total Penimbangan Bulan Ini', value: String(totalPenimbanganAll.value), icon: iconPenimbangan(), color: '#063154', trend: 0 },
    ]
  }

  // Tab posyandu tertentu → tampilkan data posyandu itu saja
  const p = posyanduStats.value.find(ps => ps.id === activeTab.value)
  if (!p) {
    return [
      { label: 'Total Balita',                value: '–', icon: iconBalita(),      color: '#2F9D94', trend: 0 },
      { label: 'Total Penimbangan Bulan Ini', value: '–', icon: iconPenimbangan(), color: '#063154', trend: 0 },
    ]
  }

  return [
    { label: 'Total Balita',                value: String(p.balita),      icon: iconBalita(),      color: '#2F9D94', trend: 0 },
    { label: 'Total Penimbangan Bulan Ini', value: String(p.penimbangan), icon: iconPenimbangan(), color: '#063154', trend: 0 },
  ]
})

// ──────────────────────────────────────────────
// Chart data (dummy — bisa diganti Supabase)
// ──────────────────────────────────────────────
const monthLabels = [
  'Jan', 'Feb', 'Mar', 'Apr',
  'Mei', 'Jun', 'Jul', 'Agu',
  'Sep', 'Okt', 'Nov', 'Des',
]

const monthlyData = ref(
  monthLabels.map(label => ({
    label,
    balita: 0,
  }))
)

const visibleMonthlyData = computed(() => monthlyData.value)

const maxVal = computed(() =>
  Math.max(1, ...monthlyData.value.map(m => m.balita))
)

function barScale(value) {
  const numericValue = Number(value) || 0
  const numericMax = Number(maxVal.value) || 1

  return String(Math.min(1, Math.max(0, numericValue / numericMax)))
}

const selectedMonthKey = ref(getCurrentMonthKey())
const selectedMonthLabel = computed(() => formatMonthLabel(selectedMonthKey.value))

const giziCountsByPosyandu = ref({})
const activeGiziCounts = computed(() => {
  if (activeTab.value === null) {
    return Object.values(giziCountsByPosyandu.value).reduce(
      (total, item) => mergeDashboardGiziCounts(total, item),
      createEmptyDashboardGiziCounts()
    )
  }

  return giziCountsByPosyandu.value[String(activeTab.value)] ?? createEmptyDashboardGiziCounts()
})

const giziData = computed(() => [
  { label: 'Gizi Baik', count: activeGiziCounts.value['Gizi Baik'] ?? 0, color: '#2F9D94' },
  { label: 'Gizi Kurang', count: activeGiziCounts.value['Gizi Kurang'] ?? 0, color: '#F7C94E' },
  { label: 'Gizi Buruk', count: activeGiziCounts.value['Gizi Buruk'] ?? 0, color: '#E55353' },
  { label: 'Gizi Lebih', count: activeGiziCounts.value['Gizi Lebih'] ?? 0, color: '#025F67' },
])

const totalGizi = computed(() =>
  giziData.value.reduce((total, item) => total + item.count, 0)
)

const donutSegments = computed(() => {
  const total = totalGizi.value
  const circumference = 314

  if (total <= 0) return []

  let offset = 0

  return giziData.value.map(item => {
    const dash = (item.count / total) * circumference
    const segment = { ...item, dash, offset: -offset }

    offset += dash

    return segment
  })
})

const mobileNavItems = computed(() =>
  (allNav ?? navItems ?? []).slice(0, 5)
)

// ──────────────────────────────────────────────
// Loading & Error
// ──────────────────────────────────────────────
const isLoading  = ref(true)
const fetchError = ref(null)

// ──────────────────────────────────────────────
// Supabase fetch
// ──────────────────────────────────────────────
async function fetchDashboardData() {
  isLoading.value = true
  fetchError.value = null

  try {
    const supabase = await getSupabase()

    const { data: ringkasan, error: errRingkasan } = await supabase
      .from('v_ringkasan_posyandu')
      .select('id, nama')
      .order('nama')

    if (errRingkasan) throw errRingkasan

    function formatLocalDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      return `${year}-${month}-${day}`
    }

    const year = currentYear.value
    const { start: startOfMonth, end: startOfNextMonth } = getMonthRangeFromKey(selectedMonthKey.value)

    const startOfYear = formatLocalDate(
      new Date(year, 0, 1)
    )

    const startOfNextYear = formatLocalDate(
      new Date(year + 1, 0, 1)
    )

    const balitaCounts = {}
    const penimbanganCounts = {}
    const monthlyPenimbanganCounts = Array(12).fill(0)
    const nextGiziCountsByPosyandu = {}

    await Promise.all(
      POSYANDU_NAMES.map(async (nama, i) => {
        const ringkasanItem = ringkasan.find(item => item.nama === nama)
        const posyanduId = ringkasanItem?.id ?? null

        const { data: balitaRows, error: eBalita } = await supabase
          .from(POSYANDU_TABLES[i])
          .select('id, tanggal_lahir, jenis_kelamin')
          .order('id')

        if (eBalita) {
          console.warn(`[Dashboard] Gagal ambil balita ${POSYANDU_TABLES[i]}:`, eBalita.message)
          balitaCounts[nama] = 0
        } else {
          balitaCounts[nama] = balitaRows?.length ?? 0
        }

        const { data: monthPenimbanganRows, error: ePenimbangan } = await supabase
          .from(PENIMBANGAN_TABLES[i])
          .select('id_bayi, berat_badan, tinggi_badan, tanggal_timbang, created_at')
          .gte('tanggal_timbang', startOfMonth)
          .lt('tanggal_timbang', startOfNextMonth)
          .order('tanggal_timbang', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false, nullsFirst: false })

        if (ePenimbangan) {
          console.warn(`[Dashboard] Gagal ambil penimbangan bulan ini ${PENIMBANGAN_TABLES[i]}:`, ePenimbangan.message)
          penimbanganCounts[nama] = 0
        } else {
          penimbanganCounts[nama] = monthPenimbanganRows?.length ?? 0
        }

        const perPosyanduGizi = createEmptyDashboardGiziCounts()
        const balitaById = new Map((balitaRows ?? []).map(row => [String(row.id), row]))
        const latestWeightAgeByBaby = {}

        ;(monthPenimbanganRows ?? []).forEach(row => {
          if (!row.id_bayi) return
          if (toNumberOrNull(row.berat_badan) === null) return

          const key = String(row.id_bayi)

          if (!latestWeightAgeByBaby[key]) {
            latestWeightAgeByBaby[key] = row
          }
        })

        Object.entries(latestWeightAgeByBaby).forEach(([idBayi, row]) => {
          const balita = balitaById.get(String(idBayi))
          if (!balita) return

          const tanggalUkur = row.tanggal_timbang ?? row.created_at ?? null
          const ageMonths = calcAgeMonthsAtDate(balita.tanggal_lahir, tanggalUkur)

          if (ageMonths === null || ageMonths < 0 || ageMonths > 60) return

          const rawLabel = classifyWeightAge({
            jenis_kelamin: balita.jenis_kelamin,
            age_months: ageMonths,
            berat_badan: row.berat_badan,
          })

          const dashboardLabel = normalizeDashboardGiziLabel(rawLabel)

          if (dashboardLabel && perPosyanduGizi[dashboardLabel] !== undefined) {
            perPosyanduGizi[dashboardLabel] += 1
          }
        })

        if (posyanduId !== null) {
          nextGiziCountsByPosyandu[String(posyanduId)] = perPosyanduGizi
        }

        const { data: yearlyPenimbangan, error: eYearlyPenimbangan } = await supabase
          .from(PENIMBANGAN_TABLES[i])
          .select('tanggal_timbang')
          .gte('tanggal_timbang', startOfYear)
          .lt('tanggal_timbang', startOfNextYear)

        if (eYearlyPenimbangan) {
          console.warn(`[Dashboard] Gagal ambil grafik tahunan ${PENIMBANGAN_TABLES[i]}:`, eYearlyPenimbangan.message)
        } else {
          ;(yearlyPenimbangan ?? []).forEach(row => {
            if (!row.tanggal_timbang) return

            const monthIndex = Number(String(row.tanggal_timbang).slice(5, 7)) - 1

            if (monthIndex >= 0 && monthIndex <= 11) {
              monthlyPenimbanganCounts[monthIndex] += 1
            }
          })
        }
      })
    )

    giziCountsByPosyandu.value = { ...nextGiziCountsByPosyandu }
    
    monthlyData.value = monthLabels.map((label, index) => ({
      label,
      balita: monthlyPenimbanganCounts[index] ?? 0,
    }))

    posyanduStats.value = ringkasan.map((p, i) => ({
      num:         String(i + 1).padStart(2, '0'),
      id:          p.id,
      nama:        p.nama.replace('Posyandu ', ''),
      status:      'Aktif',
      balita:      balitaCounts[p.nama]      ?? 0,
      penimbangan: penimbanganCounts[p.nama] ?? 0,
    }))

    totalBalitaAll.value      = Object.values(balitaCounts).reduce((a, b) => a + b, 0)
    totalPenimbanganAll.value = Object.values(penimbanganCounts).reduce((a, b) => a + b, 0)

    posyanduList.value = ringkasan.map(p => ({
      id: p.id,
      nama: p.nama,
    }))

    const newKeyMap   = {}
    const newTableMap = {}

    ringkasan.forEach((p, i) => {
      newKeyMap[p.id]   = POSYANDU_VAULT_KEYS[i]
      newTableMap[p.id] = POSYANDU_TABLES[i]
    })

    posyanduKeyMap.value   = newKeyMap
    posyanduTableMap.value = newTableMap
  } catch (err) {
    console.error('[fetchDashboardData]', err)
    fetchError.value = err.message ?? 'Gagal memuat data dashboard.'
  } finally {
    isLoading.value = false
  }
}

function runAfterFirstPaint(callback) {
  if (typeof window === 'undefined') return

  const delay = window.matchMedia('(max-width: 767px)').matches ? 700 : 0

  window.requestAnimationFrame(() => {
    window.setTimeout(callback, delay)
  })
}

onMounted(() => {
  runAfterFirstPaint(fetchDashboardData)
})

// ──────────────────────────────────────────────
// Navigation
// ──────────────────────────────────────────────
function setActiveTab(posyanduId) {
  // null  → tab Dashboard (total semua posyandu)
  // id    → tab posyandu tertentu
  activeTab.value = posyanduId
}

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────
async function handleLogout() {
  const supabase = await getSupabase()
  await supabase.auth.signOut()
  window.location.href = '/'
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

function iconPenimbangan() {
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M11 3a3 3 0 100 6 3 3 0 000-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M4 19l1.5-7h11L18 19H4z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.5 12.5C7.5 10.5 9 9 11 9s3.5 1.5 3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`
}
</script>
