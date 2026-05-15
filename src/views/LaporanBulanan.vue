<template>
  <div class="laporan-wrap">
    <!-- ══════════════════════════════════════════
         NO POSYANDU
    ══════════════════════════════════════════ -->
    <div v-if="activePosyanduId === null" class="no-posyandu-selected">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="#BCC5CC"/>
      </svg>
      <h2>Tidak Ada Data yang Akan Ditampilkan</h2>
      <p>Silahkan memilih posyandu dari tab di atas untuk melihat data</p>
    </div>

    <!-- ══════════════════════════════════════════
         PASSWORD GATE
    ══════════════════════════════════════════ -->
    <transition name="fade" mode="out-in">
      <div v-if="activePosyanduId !== null && !isUnlocked" class="password-gate" key="gate">
        <div class="gate-card">
          <div class="gate-icon-wrap">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="12" fill="#EAF7F6"/>
              <path d="M12 17v-4a6 6 0 1112 0v4" stroke="#2F9D94" stroke-width="1.8" stroke-linecap="round"/>
              <rect x="8" y="17" width="20" height="13" rx="3" fill="#2F9D94"/>
              <circle cx="18" cy="23" r="2" fill="white"/>
              <path d="M18 25v2" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>

          <h2 class="gate-title">Akses Terbatas</h2>
          <p class="gate-subtitle">
            Masukkan password untuk mengakses data<br>
            <strong>{{ activePosyanduNama }}</strong>
          </p>

          <div class="gate-form">
            <div class="input-wrap" :class="{ error: pwError }">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="input-icon">
                <path d="M6 7V5a3 3 0 116 0v2M4 7h8a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z"
                  stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                <circle cx="8" cy="11" r="1" fill="currentColor"/>
              </svg>

              <input
                :type="showPw ? 'text' : 'password'"
                v-model="pwInput"
                placeholder="Masukkan password posyandu..."
                class="pw-input"
                @keyup.enter="submitPassword"
                @input="pwError = ''"
                ref="pwInputRef"
                autocomplete="current-password"
              />

              <button class="toggle-pw" @click="showPw = !showPw" type="button" tabindex="-1">
                <svg v-if="!showPw" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5S1 8 1 8z" stroke="currentColor" stroke-width="1.3"/>
                  <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.3"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2l12 12M6.5 6.6A2 2 0 0110 10M1 8s2.5-5 7-5c1.1 0 2.1.2 3 .6M15 8s-1 2-3 3.4"
                    stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <p class="pw-error" v-if="pwError">{{ pwError }}</p>

            <button class="gate-btn" @click="submitPassword" :disabled="pwLoading">
              <span v-if="pwLoading" class="spinner"></span>
              <span v-else>Masuk →</span>
            </button>
          </div>

          <p class="gate-hint">Hubungi administrator jika lupa password</p>
        </div>
      </div>
    </transition>

    <!-- ══════════════════════════════════════════
         MAIN PAGE
    ══════════════════════════════════════════ -->
    <transition name="fade" mode="out-in">
      <div v-if="activePosyanduId !== null && isUnlocked" class="laporan-page" key="page">
        <template v-if="!isGraphPage">
          <!-- Toolbar -->
          <div class="laporan-toolbar">
            <div class="toolbar-left">
              <div class="toolbar-info">
                <span class="toolbar-posyandu">{{ activePosyanduNama }}</span>
                <span class="toolbar-count">{{ filteredBalita.length }} balita terdaftar</span>
              </div>
            </div>

            <div class="toolbar-right laporan-toolbar-right">
              <div class="search-wrap">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.3"/>
                  <path d="M10.5 10.5l3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                </svg>
                <input v-model="searchQuery" placeholder="Cari nama balita / ibu..." class="search-input"/>
              </div>

              <select v-model="filterGender" class="filter-select gender-select">
                <option value="">Semua Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>

              <select v-model="selectedMonth" class="filter-select period-select month-select">
                <option v-for="m in monthOptions" :key="m.value" :value="m.value">
                  {{ m.label }}
                </option>
              </select>

              <select v-model.number="selectedYear" class="filter-select period-select year-select">
                <option v-for="y in yearOptions" :key="y" :value="y">
                  {{ y }}
                </option>
              </select>

              <button class="btn-lock" @click="lockPage" title="Kunci halaman">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M4.5 6.5V4a3 3 0 016 0v2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                  <rect x="2" y="6.5" width="11" height="8" rx="2" stroke="currentColor" stroke-width="1.3"/>
                  <circle cx="7.5" cy="10.5" r="1" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="laporan-period-card">
            <div>
              <span class="period-label">Periode Grafik</span>
              <strong>{{ selectedPeriodLabel }}</strong>
            </div>
            <p>Grafik akan mengambil data dari hasil penimbangan sesuai bulan dan tahun yang dipilih.</p>
          </div>

          <!-- Loading -->
          <div class="table-loading" v-if="tableLoading">
            <div class="spinner-lg"></div>
            <span>Memuat data laporan bulanan...</span>
          </div>

          <!-- Error -->
          <div class="table-error" v-else-if="tableError">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="#E55353" stroke-width="1.5"/>
              <path d="M10 6v4M10 14h.01" stroke="#E55353" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            {{ tableError }}
            <button @click="fetchData">Coba Lagi</button>
          </div>

          <!-- Empty -->
          <div class="table-empty" v-else-if="filteredBalita.length === 0 && !tableLoading">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="#BCC5CC" stroke-width="1.5"/>
              <path d="M13 20h14M20 13v14" stroke="#BCC5CC" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <p>{{ searchQuery || filterGender ? 'Tidak ada data yang cocok dengan filter' : 'Belum ada data balita terdaftar.' }}</p>
          </div>

          <!-- Table -->
          <div class="table-wrap" v-else>
            <table class="laporan-table">
              <thead>
                <tr>
                  <th class="col-no">No</th>
                  <th class="col-nama">Nama Balita</th>
                  <th class="col-ibu">Nama Ibu</th>
                  <th class="col-detail">Detail</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(b, i) in filteredBalita" :key="b.id" class="table-row">
                  <td class="col-no">{{ i + 1 }}</td>

                  <td class="col-nama">
                    <div class="nama-wrap">
                      <div class="nama-avatar" :class="b.jenis_kelamin === 'Laki-laki' ? 'laki' : 'perempuan'">
                        {{ b.nama_lengkap?.[0] ?? '?' }}
                      </div>
                      <span class="nama-text">{{ b.nama_lengkap }}</span>
                    </div>
                  </td>

                  <td class="col-ibu">{{ b.nama_ibu }}</td>

                  <td class="col-detail">
                    <button class="btn-detail" @click="openDetail(b)" :disabled="chartLoading">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1.5C3.96 1.5 1.5 3.96 1.5 7S3.96 12.5 7 12.5 12.5 10.04 12.5 7 10.04 1.5 7 1.5z" stroke="currentColor" stroke-width="1.3"/>
                        <path d="M7 6.5v4M7 4.5h.01" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                      </svg>
                      Lihat Grafik
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <GrafikBalitaPage
          v-else
          :selected-balita="selectedBalita"
          :chart-loading="chartLoading"
          :selected-period-label="selectedPeriodLabel"
          @back="backToListPage"
        />
      </div>
    </transition>

    <!-- ═══════════════════════════════════════════════
         MODAL SESSION EXPIRED
         ═══════════════════════════════════════════════ -->
    <teleport to="body">
      <transition name="modal-fade">
        <div class="modal-overlay" v-if="showSessionExpiredModal" @click.self="closeSessionExpiredModal">
          <div class="modal-box modal-sm">
            <div class="modal-header danger">
              <h3>Sesi Berakhir</h3>
              <button class="modal-close" @click="closeSessionExpiredModal">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <div class="modal-body delete-body">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" fill="#FEF0F0"/>
                <path d="M24 14v12M24 32h.01" stroke="#E55353" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <p><strong>Waktu habis, silahkan masukkan password lagi</strong></p>
              <p class="delete-warn">Sesi Anda telah berakhir karena tidak ada aktivitas selama 30 menit.</p>
            </div>

            <div class="modal-footer">
              <button class="btn-save" @click="closeSessionExpiredModal">OK</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Toast -->
    <teleport to="body">
      <transition name="toast">
        <div class="toast" :class="toast.type" v-if="toast.show">{{ toast.msg }}</div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useSessionStore } from '../stores/sessionStore'
import { supabase } from '../lib/supabase'
import GrafikBalitaPage from './GrafikBalitaPage.vue'
import '../assets/LaporanBulanan.css'

// ── Stores ────────────────────────────────────────
const sessionStore = useSessionStore()

// ── Props ────────────────────────────────────────────────
const props = defineProps({
  activePosyanduId: { type: [String, null], default: null },
  activePosyanduNama: { type: String, default: '' },
  posyanduKeyMap: { type: Object, default: () => ({}) },
  posyanduTableMap: { type: Object, default: () => ({}) },
})

// ── Password Gate State ──────────────────────────────────
const pwInput = ref('')
const showPw = ref(false)
const pwError = ref('')
const pwLoading = ref(false)
const pwInputRef = ref(null)
const showSessionExpiredModal = ref(false)

const isUnlocked = computed(() => {
  return sessionStore.isSessionUnlocked(props.activePosyanduId)
})

// ── Data ─────────────────────────────────────────────────
const balitaList = ref([])
const tableLoading = ref(false)
const tableError = ref(null)
const searchQuery = ref('')
const filterGender = ref('')

const now = new Date()

const monthOptions = [
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
]

const selectedMonth = ref(String(now.getMonth() + 1).padStart(2, '0'))
const selectedYear = ref(now.getFullYear())

const yearOptions = computed(() => {
  const year = new Date().getFullYear()
  return [year - 2, year - 1, year, year + 1]
})

const selectedPeriodLabel = computed(() => {
  const month = monthOptions.find(m => m.value === selectedMonth.value)?.label ?? ''
  return `${month} ${selectedYear.value}`
})

const filteredBalita = computed(() => {
  let list = balitaList.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(b =>
      b.nama_lengkap?.toLowerCase().includes(q) ||
      b.nama_ibu?.toLowerCase().includes(q)
    )
  }

  if (filterGender.value) {
    list = list.filter(b => b.jenis_kelamin === filterGender.value)
  }

  return list
})

// ── Grafik Page State ────────────────────────────────────
const isGraphPage = ref(false)
const selectedBalita = ref(null)
const chartLoading = ref(false)

// ── Watchers ─────────────────────────────────────────────
watch(() => sessionStore.sessionExpiredPosyanduId, (expiredId) => {
  if (expiredId === props.activePosyanduId) {
    showSessionExpiredModal.value = true
    balitaList.value = []
    resetGraphPage()
  }
})

watch(() => props.activePosyanduId, () => {
  pwInput.value = ''
  pwError.value = ''
  showPw.value = false
  resetGraphPage()

  if (!isUnlocked.value) {
    nextTick(() => pwInputRef.value?.focus())
  } else {
    fetchData()
  }
})

watch(() => balitaList.value, () => {
  if (!selectedBalita.value || !isGraphPage.value) return

  const updated = balitaList.value.find(b => b.id === selectedBalita.value.id)
  if (!updated) return

  selectedBalita.value = {
    ...updated,
    berat_badan: selectedBalita.value.berat_badan,
    tinggi_badan: selectedBalita.value.tinggi_badan,
    hasil_penimbangan: selectedBalita.value.hasil_penimbangan ?? [],
  }
}, { deep: true })

// ── Password Actions ─────────────────────────────────────
async function submitPassword() {
  if (!pwInput.value.trim()) {
    pwError.value = 'Password tidak boleh kosong'
    return
  }

  pwLoading.value = true
  pwError.value = ''

  try {
    const posyanduKey = props.posyanduKeyMap[props.activePosyanduId]
    if (!posyanduKey) throw new Error('Posyandu tidak dikenali')

    const isValid = await sessionStore.unlockSession(
      props.activePosyanduId,
      posyanduKey,
      pwInput.value
    )

    if (isValid) {
      pwInput.value = ''
      await fetchData()
      showToast('Akses diberikan selama 30 menit', 'success')
    } else {
      pwError.value = 'Password salah. Silakan coba lagi.'
      pwInput.value = ''
      nextTick(() => pwInputRef.value?.focus())
    }
  } catch (err) {
    pwError.value = err.message || 'Gagal memverifikasi password.'
  } finally {
    pwLoading.value = false
  }
}

function lockPage() {
  if (!props.activePosyanduId) return

  sessionStore.lockSession(props.activePosyanduId)
  balitaList.value = []
  resetGraphPage()
}

function closeSessionExpiredModal() {
  showSessionExpiredModal.value = false
  sessionStore.resetSessionExpired()
}

// ── Fetching Data ────────────────────────────────────────
async function fetchData() {
  if (!props.activePosyanduId) return

  const tableName = props.posyanduTableMap[props.activePosyanduId]
  if (!tableName) return

  tableLoading.value = true
  tableError.value = null

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('nama_lengkap')

    if (error) throw error

    balitaList.value = data ?? []
  } catch (err) {
    tableError.value = 'Gagal memuat data: ' + (err.message ?? err)
  } finally {
    tableLoading.value = false
  }
}

async function openDetail(b) {
  selectedBalita.value = {
    ...b,
    hasil_penimbangan: [],
    berat_badan: null,
    tinggi_badan: null,
  }

  isGraphPage.value = true
  chartLoading.value = true

  try {
    const posyanduKey = props.posyanduKeyMap[props.activePosyanduId]
    if (!posyanduKey) throw new Error('Posyandu tidak dikenali')

    const hasilTableName = `hasil_penimbangan_${posyanduKey}`
    const { startDate, endDate } = getSelectedPeriodRange()

    const { data, error } = await supabase
      .from(hasilTableName)
      .select('id_bayi, berat_badan, tinggi_badan, tanggal_timbang, created_at')
      .eq('id_bayi', b.id)
      .gte('tanggal_timbang', startDate)
      .lt('tanggal_timbang', endDate)
      .order('tanggal_timbang', { ascending: true })

    if (error) throw error

    const hasilPenimbangan = (data ?? [])
      .filter(row => row.berat_badan !== null && row.berat_badan !== undefined)
      .map(row => ({
        ...row,
        berat_badan: Number(row.berat_badan),
        tinggi_badan: row.tinggi_badan !== null && row.tinggi_badan !== undefined
          ? Number(row.tinggi_badan)
          : null,
        age_months: calcAgeMonthsAtDate(b.tanggal_lahir, row.tanggal_timbang),
      }))
      .filter(row => row.age_months !== null && row.age_months >= 0 && row.age_months <= 60)

    if (hasilPenimbangan.length === 0) {
      showToast('Tidak ditemukan data', 'error')
    }

    const latest = hasilPenimbangan[hasilPenimbangan.length - 1] ?? null

    selectedBalita.value = {
      ...b,
      berat_badan: latest?.berat_badan ?? null,
      tinggi_badan: latest?.tinggi_badan ?? null,
      hasil_penimbangan: hasilPenimbangan,
    }
  } catch (err) {
    selectedBalita.value = {
      ...b,
      hasil_penimbangan: [],
      berat_badan: null,
      tinggi_badan: null,
    }

    showToast(err.message ?? 'Gagal memuat grafik', 'error')
  } finally {
    chartLoading.value = false
  }
}

function backToListPage() {
  resetGraphPage()
}

function resetGraphPage() {
  isGraphPage.value = false
  selectedBalita.value = null
  chartLoading.value = false
}

// ── Date Helpers ─────────────────────────────────────────
function formatLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getSelectedPeriodRange() {
  const year = Number(selectedYear.value)
  const monthIndex = Number(selectedMonth.value) - 1

  const startDate = formatLocalDate(new Date(year, monthIndex, 1))
  const endDate = formatLocalDate(new Date(year, monthIndex + 1, 1))

  return { startDate, endDate }
}

function calcAgeMonthsAtDate(dob, targetDate) {
  if (!dob || !targetDate) return null

  const birth = new Date(dob)
  const target = new Date(targetDate)

  let months = (target.getFullYear() - birth.getFullYear()) * 12
  months += target.getMonth() - birth.getMonth()

  if (target.getDate() < birth.getDate()) {
    months -= 1
  }

  return Math.max(0, months)
}

// ── Toast ─────────────────────────────────────────────────
const toast = ref({ show: false, msg: '', type: 'success' })
let toastTimer = null

function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  toast.value = { show: true, msg, type }
  toastTimer = setTimeout(() => { toast.value.show = false }, 3200)
}

// ── Lifecycle ────────────────────────────────────────────
onMounted(() => {
  if (isUnlocked.value) {
    fetchData()
  }
})
</script>
