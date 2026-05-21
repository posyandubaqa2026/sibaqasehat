<template>
  <div class="data-balita-wrap">

    <!-- ═══════════════════════════════════════════════
         DASHBOARD TAB — ringkasan semua posyandu
         ═══════════════════════════════════════════════ -->
    <div v-if="activePosyanduId === null" class="no-posyandu-selected">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="#BCC5CC"/>
      </svg>
      <h2>Tidak Ada Data yang Akan Ditampilkan</h2>
      <p>Silahkan memilih posyandu dari tab di atas untuk melihat data</p>
    </div>

    <!-- ═══════════════════════════════════════════════
         PASSWORD GATE
         ═══════════════════════════════════════════════ -->
    <transition name="fade" mode="out-in">
      <div v-if="activePosyanduId !== null && !isUnlocked" class="password-gate" key="gate">
        <div class="gate-card">
          <!-- Icon kunci -->
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

          <!-- Form password -->
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

          <!-- Hint attempts -->
          <p class="gate-hint">
            Hubungi administrator jika lupa password
          </p>
        </div>
      </div>
    </transition>

    <!-- ═══════════════════════════════════════════════
         HALAMAN KLASIFIKASI BALITA (setelah unlock)
         ═══════════════════════════════════════════════ -->
    <transition name="fade" mode="out-in">
      <div v-if="activePosyanduId !== null && isUnlocked" class="balita-page" key="page">

        <!-- ── Toolbar ── -->
        <div class="balita-toolbar">
          <div class="toolbar-left">
            <div class="toolbar-info">
              <span class="toolbar-posyandu">{{ activePosyanduNama }}</span>
              <span class="toolbar-count">{{ filteredBalita.length }} balita terdaftar · Periode {{ selectedMonthLabel }}</span>
            </div>
          </div>
          <div class="toolbar-right">
            <div class="month-switcher" aria-label="Pilih bulan klasifikasi">
              <button
                class="month-nav-btn"
                type="button"
                title="Bulan sebelumnya"
                @click="shiftSelectedMonth(-1)"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>

              <input
                v-model="selectedMonthKey"
                type="month"
                class="month-input"
                aria-label="Bulan klasifikasi"
              />

              <button
                class="month-nav-btn"
                type="button"
                title="Bulan berikutnya"
                @click="shiftSelectedMonth(1)"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>

              <button
                class="month-today-btn"
                type="button"
                @click="resetSelectedMonth"
              >
                Bulan Ini
              </button>
            </div>

            <div class="search-wrap">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.3"/>
                <path d="M10.5 10.5l3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
              <input v-model="searchQuery" placeholder="Cari nama balita / ibu..." class="search-input"/>
            </div>
            <select v-model="filterGender" class="filter-select">
              <option value="">Semua Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
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

        <!-- ── Loading ── -->
        <div class="table-loading" v-if="tableLoading">
          <div class="spinner-lg"></div>
          <span>Memuat data klasifikasi balita...</span>
        </div>

        <!-- ── Error ── -->
        <div class="table-error" v-else-if="tableError">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#E55353" stroke-width="1.5"/>
            <path d="M10 6v4M10 14h.01" stroke="#E55353" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          {{ tableError }}
          <button @click="fetchData">Coba Lagi</button>
        </div>

        <!-- ── Empty ── -->
        <div class="table-empty" v-else-if="filteredBalita.length === 0 && !tableLoading">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="#BCC5CC" stroke-width="1.5"/>
            <path d="M13 20h14M20 13v14" stroke="#BCC5CC" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <p>{{ searchQuery || filterGender ? 'Tidak ada data yang cocok dengan filter' : 'Belum ada data balita terdaftar.' }}</p>
        </div>

        <!-- ── Table ── -->
        <div class="table-wrap" v-else>
          <table class="balita-table">
            <thead>
              <tr>
                <th class="col-no">No</th>
                <th class="col-nama">Nama Balita</th>
                <th class="col-ibu">Nama Ibu</th>
                <th class="col-jk">Jenis Kelamin</th>
                <th class="col-who-status">BB/U</th>
                <th class="col-who-status">PB/U</th>
                <th class="col-who-status">BB/PB</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, i) in filteredBalita" :key="b.id" class="table-row">
                <td class="col-no">{{ i + 1 }}</td>
                <td class="col-nama">
                  <div class="nama-wrap">
                    <div class="nama-avatar" :class="b.jenis_kelamin === 'Laki-laki' ? 'laki' : 'perempuan'">
                      {{ b.nama_lengkap[0] }}
                    </div>
                    <div>
                      <span class="nama-text">{{ b.nama_lengkap }}</span>
                    </div>
                  </div>
                </td>
                <td class="col-ibu">{{ b.nama_ibu }}</td>
                <td class="col-jk">
                  <span class="jk-badge" :class="b.jenis_kelamin === 'Laki-laki' ? 'laki' : 'perempuan'">
                    {{ b.jenis_kelamin === 'Laki-laki' ? 'L' : 'P' }}
                  </span>
                </td>
                <td class="col-who-status">
                  <span class="who-status-badge" :class="getWHOStatusClass(b, 'weightAge')">
                    {{ getWHOStatusLabel(b, 'weightAge') }}
                    <small v-if="getWHOZScore(b, 'weightAge') !== null">
                      ({{ formatZScore(getWHOZScore(b, 'weightAge')) }})
                    </small>
                  </span>
                </td>
                <td class="col-who-status">
                  <span class="who-status-badge" :class="getWHOStatusClass(b, 'lengthAge')">
                    {{ getWHOStatusLabel(b, 'lengthAge') }}
                    <small v-if="getWHOZScore(b, 'lengthAge') !== null">
                      ({{ formatZScore(getWHOZScore(b, 'lengthAge')) }})
                    </small>
                  </span>
                </td>
                <td class="col-who-status">
                  <span class="who-status-badge" :class="getWHOStatusClass(b, 'weightLength')">
                    {{ getWHOStatusLabel(b, 'weightLength') }}
                    <small v-if="getWHOZScore(b, 'weightLength') !== null">
                      ({{ formatZScore(getWHOZScore(b, 'weightLength')) }})
                    </small>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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

    <!-- Toast Notifikasi -->
    <teleport to="body">
      <transition name="toast">
        <div class="toast" :class="toast.type" v-if="toast.show">
          <svg v-if="toast.type === 'success'" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" fill="#16A87A"/>
            <path d="M5 8l2 2 4-4" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" fill="#E55353"/>
            <path d="M8 5v3M8 11h.01" stroke="white" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          {{ toast.msg }}
        </div>
      </transition>
    </teleport>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useSessionStore } from '../stores/sessionStore'
import { supabase } from '../lib/supabase'
import '../assets/KlasifikasiBalita.css'

// ── Stores ─────────────────────────────────────
const sessionStore = useSessionStore()

// ── Props ──────────────────────────────────────
const props = defineProps({
  activePosyanduId:   { type: [String, null], default: null },
  activePosyanduNama: { type: String, default: '' },
  posyanduKeyMap: {
    type: Object,
    default: () => ({})
  },
  posyanduTableMap: {
    type: Object,
    default: () => ({})
  }
})

// ─────────────────────────────────────────────────────
// PASSWORD GATE STATE
// Menggunakan session store untuk unlock state
// ─────────────────────────────────────────────────────
const pwInput     = ref('')
const showPw      = ref(false)
const pwError     = ref('')
const pwLoading   = ref(false)
const pwInputRef  = ref(null)
const showSessionExpiredModal = ref(false)

const isUnlocked = computed(() => {
  return sessionStore.isSessionUnlocked(props.activePosyanduId)
})

// Watch session expired dari store
watch(() => sessionStore.sessionExpiredPosyanduId, (expiredId) => {
  if (expiredId === props.activePosyanduId) {
    showSessionExpiredModal.value = true
    balitaList.value = []
  }
})

// Reset password input setiap ganti posyandu
watch(() => props.activePosyanduId, () => {
  pwInput.value = ''
  pwError.value = ''
  showPw.value  = false

   // TAMBAH INI

  if (!isUnlocked.value) {
    nextTick(() => pwInputRef.value?.focus())
  } else {
    fetchData()
  }
})

async function submitPassword() {
  if (!pwInput.value.trim()) {
    pwError.value = 'Password tidak boleh kosong'
    return
  }

  pwLoading.value = true
  pwError.value   = ''

  try {
    const posyanduKey = props.posyanduKeyMap[props.activePosyanduId]
    if (!posyanduKey) throw new Error('Posyandu tidak dikenali')

    // Gunakan session store untuk unlock
    const isValid = await sessionStore.unlockSession(
      props.activePosyanduId,
      posyanduKey,
      pwInput.value
    )

    if (isValid) {
      pwInput.value = ''
      fetchData()
      showToast('Akses diberikan selama 30 menit', 'success')
    } else {
      pwError.value = 'Password salah. Silakan coba lagi.'
      pwInput.value = ''
      nextTick(() => pwInputRef.value?.focus())
    }
  } catch (err) {
    console.error('[submitPassword] Error:', err.message)
    pwError.value = err.message || 'Gagal memverifikasi password. Coba lagi.'
  } finally {
    pwLoading.value = false
  }
}

function lockPage() {
  if (props.activePosyanduId) {
    sessionStore.lockSession(props.activePosyanduId)
    balitaList.value = []
  }
}

function closeSessionExpiredModal() {
  showSessionExpiredModal.value = false
  sessionStore.resetSessionExpired()
}

// ─────────────────────────────────────────────────────
// DATA STATE
// ─────────────────────────────────────────────────────
const balitaList   = ref([])
const tableLoading = ref(false)
const tableError   = ref(null)
const searchQuery  = ref('')
const filterGender = ref('')
const selectedMonthKey = ref(getCurrentMonthKey())

const selectedMonthLabel = computed(() => formatMonthLabel(selectedMonthKey.value))
watch(selectedMonthKey, () => {
  if (props.activePosyanduId && isUnlocked.value) {
    fetchData()
  }
})



function pad2(value) {
  return String(value).padStart(2, '0')
}

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`
}

function getCurrentMonthKey() {
  return getMonthKey(new Date())
}

function parseMonthKey(monthKey) {
  const [year, month] = String(monthKey || '').split('-').map(Number)

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return new Date()
  }

  return new Date(year, month - 1, 1)
}

function formatMonthLabel(monthKey) {
  return parseMonthKey(monthKey).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })
}

function shiftSelectedMonth(delta) {
  const date = parseMonthKey(selectedMonthKey.value)
  date.setMonth(date.getMonth() + delta)
  selectedMonthKey.value = getMonthKey(date)
}

function resetSelectedMonth() {
  selectedMonthKey.value = getCurrentMonthKey()
}

function isSameMonth(dateValue, monthKey) {
  if (!dateValue || !monthKey) return false

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return false

  return getMonthKey(date) === monthKey
}

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

async function fetchData() {
  if (!props.activePosyanduId) return
  const tableName = props.posyanduTableMap[props.activePosyanduId]
  if (!tableName) return

  tableLoading.value = true
  tableError.value   = null

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('nama_lengkap')

    if (error) throw error

    const posyanduKey = props.posyanduKeyMap[props.activePosyanduId]
    const hasilTableName = `hasil_penimbangan_${posyanduKey}`

    const { data: hasilData, error: hasilError } = await supabase
      .from(hasilTableName)
      .select('id_bayi, tinggi_badan, berat_badan, tanggal_timbang, created_at')
      .order('tanggal_timbang', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false, nullsFirst: false })

    if (hasilError) {
      console.warn('[fetchData] Warning fetch hasil penimbangan:', hasilError.message)
    }

    const hasilMap = {}

    ;(hasilData ?? []).forEach(row => {
      if (!row.id_bayi) return

      const tanggalUkur = row.tanggal_timbang ?? row.created_at ?? null
      const normalized = {
        ...row,
        tinggi_badan: toNumberOrNull(row.tinggi_badan),
        berat_badan: toNumberOrNull(row.berat_badan),
        tanggal_timbang: tanggalUkur,
        created_at: row.created_at ?? null,
      }

      if (!hasilMap[row.id_bayi]) hasilMap[row.id_bayi] = []
      hasilMap[row.id_bayi].push(normalized)
    })

    balitaList.value = (data ?? []).map(b => {
      const rows = hasilMap[b.id] ?? []

      const rowsWithAge = rows
        .map(row => ({
          ...row,
          age_months: calcAgeMonthsAtDate(b.tanggal_lahir, row.tanggal_timbang ?? row.created_at),
        }))
        .filter(row => row.age_months !== null && row.age_months >= 0 && row.age_months <= 60)

      const rowsInSelectedMonth = rowsWithAge.filter(row =>
        isSameMonth(row.tanggal_timbang ?? row.created_at, selectedMonthKey.value)
      )

      const latestAny = rowsInSelectedMonth[0] ?? null

      const latestWeightAge = rowsInSelectedMonth.find(row =>
        row.berat_badan !== null
      ) ?? null

      const latestLengthAge = rowsInSelectedMonth.find(row =>
        row.tinggi_badan !== null
      ) ?? null

      const latestWeightLength = rowsInSelectedMonth.find(row =>
        row.berat_badan !== null &&
        row.tinggi_badan !== null &&
        row.tinggi_badan >= 45 &&
        row.tinggi_badan <= 120
      ) ?? null

      return {
        ...b,
        tinggi_badan: latestAny?.tinggi_badan ?? b.tinggi_badan ?? null,
        berat_badan: latestAny?.berat_badan ?? b.berat_badan ?? null,
        tanggal_timbang: latestAny?.tanggal_timbang ?? latestAny?.created_at ?? null,
        age_months: latestAny?.age_months ?? calcAgeMonthsAtDate(b.tanggal_lahir),
        whoPoints: {
          weightAge: latestWeightAge,
          lengthAge: latestLengthAge,
          weightLength: latestWeightLength,
        },
      }
    })
  } catch (err) {
    tableError.value = 'Gagal memuat data: ' + (err.message ?? err)
  } finally {
    tableLoading.value = false
  }
}

// ─────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────
const toast = ref({ show: false, msg: '', type: 'success' })
let toastTimer = null
function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  toast.value = { show: true, msg, type }
  toastTimer = setTimeout(() => { toast.value.show = false }, 3200)
}

// ─────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
function formatDate(d) {
  if (!d) return '–'
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

// eslint-disable-next-line no-unused-vars
function calcAge(dob) {
  if (!dob) return '–'
  const today  = new Date()
  const birth  = new Date(dob)
  const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())
  if (months < 24) return `${months} bln`
  return `${Math.floor(months / 12)} thn`
}

// ─────────────────────────────────────────────────────
// WHO CLASSIFICATION REFERENCE
// Data ini mengikuti struktur yang sama dengan GrafikBalitaPage.vue
// ─────────────────────────────────────────────────────
const WHO_BOYS = [
  { m:0,  SD3neg:2.1, SD2neg:2.5, SD0:3.3, SD2:4.4, SD3:5.0 },
  { m:1,  SD3neg:2.9, SD2neg:3.4, SD0:4.5, SD2:5.8, SD3:6.6 },
  { m:2,  SD3neg:3.8, SD2neg:4.4, SD0:5.6, SD2:7.1, SD3:8.0 },
  { m:3,  SD3neg:4.4, SD2neg:5.0, SD0:6.4, SD2:8.0, SD3:9.0 },
  { m:4,  SD3neg:4.8, SD2neg:5.6, SD0:7.0, SD2:8.7, SD3:9.7 },
  { m:5,  SD3neg:5.3, SD2neg:6.1, SD0:7.5, SD2:9.3, SD3:10.4 },
  { m:6,  SD3neg:5.7, SD2neg:6.4, SD0:7.9, SD2:9.8, SD3:10.9 },
  { m:7,  SD3neg:5.9, SD2neg:6.7, SD0:8.3, SD2:10.3, SD3:11.4 },
  { m:8,  SD3neg:6.2, SD2neg:7.0, SD0:8.6, SD2:10.7, SD3:11.9 },
  { m:9,  SD3neg:6.4, SD2neg:7.2, SD0:8.9, SD2:11.0, SD3:12.3 },
  { m:10, SD3neg:6.6, SD2neg:7.5, SD0:9.2, SD2:11.4, SD3:12.7 },
  { m:11, SD3neg:6.8, SD2neg:7.7, SD0:9.4, SD2:11.7, SD3:13.0 },
  { m:12, SD3neg:6.9, SD2neg:7.8, SD0:9.6, SD2:11.9, SD3:13.3 },
  { m:13, SD3neg:7.1, SD2neg:8.0, SD0:9.9, SD2:12.3, SD3:13.7 },
  { m:14, SD3neg:7.2, SD2neg:8.2, SD0:10.1, SD2:12.6, SD3:14.0 },
  { m:15, SD3neg:7.4, SD2neg:8.4, SD0:10.3, SD2:12.8, SD3:14.3 },
  { m:16, SD3neg:7.5, SD2neg:8.5, SD0:10.5, SD2:13.1, SD3:14.6 },
  { m:17, SD3neg:7.7, SD2neg:8.7, SD0:10.7, SD2:13.4, SD3:14.9 },
  { m:18, SD3neg:7.8, SD2neg:8.9, SD0:10.9, SD2:13.6, SD3:15.2 },
  { m:19, SD3neg:8.0, SD2neg:9.0, SD0:11.1, SD2:13.9, SD3:15.5 },
  { m:20, SD3neg:8.1, SD2neg:9.2, SD0:11.3, SD2:14.2, SD3:15.9 },
  { m:21, SD3neg:8.2, SD2neg:9.4, SD0:11.5, SD2:14.5, SD3:16.2 },
  { m:22, SD3neg:8.4, SD2neg:9.5, SD0:11.8, SD2:14.7, SD3:16.5 },
  { m:23, SD3neg:8.5, SD2neg:9.7, SD0:12.0, SD2:15.0, SD3:16.8 },
  { m:24, SD3neg:8.6, SD2neg:9.8, SD0:12.2, SD2:15.3, SD3:17.1 },
  { m:25, SD3neg:8.8, SD2neg:10.0, SD0:12.4, SD2:15.5, SD3:17.4 },
  { m:26, SD3neg:8.9, SD2neg:10.1, SD0:12.5, SD2:15.8, SD3:17.7 },
  { m:27, SD3neg:9.0, SD2neg:10.3, SD0:12.7, SD2:16.0, SD3:18.0 },
  { m:28, SD3neg:9.1, SD2neg:10.4, SD0:12.9, SD2:16.3, SD3:18.3 },
  { m:29, SD3neg:9.2, SD2neg:10.5, SD0:13.1, SD2:16.5, SD3:18.6 },
  { m:30, SD3neg:9.4, SD2neg:10.7, SD0:13.3, SD2:16.8, SD3:18.9 },
  { m:31, SD3neg:9.5, SD2neg:10.8, SD0:13.5, SD2:17.0, SD3:19.2 },
  { m:32, SD3neg:9.6, SD2neg:11.0, SD0:13.7, SD2:17.3, SD3:19.5 },
  { m:33, SD3neg:9.7, SD2neg:11.1, SD0:13.8, SD2:17.5, SD3:19.7 },
  { m:34, SD3neg:9.8, SD2neg:11.2, SD0:14.0, SD2:17.8, SD3:20.0 },
  { m:35, SD3neg:9.9, SD2neg:11.3, SD0:14.2, SD2:18.0, SD3:20.3 },
  { m:36, SD3neg:10.0, SD2neg:11.5, SD0:14.3, SD2:18.3, SD3:20.6 },
  { m:37, SD3neg:10.1, SD2neg:11.6, SD0:14.5, SD2:18.5, SD3:20.9 },
  { m:38, SD3neg:10.2, SD2neg:11.7, SD0:14.7, SD2:18.7, SD3:21.2 },
  { m:39, SD3neg:10.3, SD2neg:11.8, SD0:14.9, SD2:19.0, SD3:21.5 },
  { m:40, SD3neg:10.4, SD2neg:12.0, SD0:15.1, SD2:19.2, SD3:21.8 },
  { m:41, SD3neg:10.5, SD2neg:12.1, SD0:15.3, SD2:19.5, SD3:22.1 },
  { m:42, SD3neg:10.6, SD2neg:12.2, SD0:15.4, SD2:19.7, SD3:22.4 },
  { m:43, SD3neg:10.7, SD2neg:12.3, SD0:15.6, SD2:20.0, SD3:22.7 },
  { m:44, SD3neg:10.8, SD2neg:12.4, SD0:15.8, SD2:20.2, SD3:23.0 },
  { m:45, SD3neg:10.9, SD2neg:12.6, SD0:16.0, SD2:20.5, SD3:23.3 },
  { m:46, SD3neg:11.0, SD2neg:12.7, SD0:16.2, SD2:20.7, SD3:23.6 },
  { m:47, SD3neg:11.1, SD2neg:12.8, SD0:16.4, SD2:21.0, SD3:23.9 },
  { m:48, SD3neg:11.2, SD2neg:12.9, SD0:16.6, SD2:21.2, SD3:24.2 },
  { m:49, SD3neg:11.3, SD2neg:13.0, SD0:16.7, SD2:21.4, SD3:24.5 },
  { m:50, SD3neg:11.4, SD2neg:13.2, SD0:16.9, SD2:21.7, SD3:24.8 },
  { m:51, SD3neg:11.5, SD2neg:13.3, SD0:17.1, SD2:21.9, SD3:25.1 },
  { m:52, SD3neg:11.6, SD2neg:13.4, SD0:17.3, SD2:22.2, SD3:25.4 },
  { m:53, SD3neg:11.7, SD2neg:13.5, SD0:17.5, SD2:22.4, SD3:25.7 },
  { m:54, SD3neg:11.8, SD2neg:13.7, SD0:17.7, SD2:22.7, SD3:26.0 },
  { m:55, SD3neg:11.9, SD2neg:13.8, SD0:17.9, SD2:22.9, SD3:26.3 },
  { m:56, SD3neg:12.0, SD2neg:13.9, SD0:18.1, SD2:23.2, SD3:26.7 },
  { m:57, SD3neg:12.1, SD2neg:14.0, SD0:18.3, SD2:23.4, SD3:27.0 },
  { m:58, SD3neg:12.2, SD2neg:14.2, SD0:18.5, SD2:23.7, SD3:27.3 },
  { m:59, SD3neg:12.3, SD2neg:14.3, SD0:18.7, SD2:23.9, SD3:27.6 },
  { m:60, SD3neg:12.4, SD2neg:14.4, SD0:18.9, SD2:24.2, SD3:27.9 },
]

const WHO_GIRLS = [
  { m:0,  SD3neg:2.0, SD2neg:2.4, SD0:3.2, SD2:4.2, SD3:4.8 },
  { m:1,  SD3neg:2.7, SD2neg:3.2, SD0:4.2, SD2:5.5, SD3:6.2 },
  { m:2,  SD3neg:3.4, SD2neg:3.9, SD0:5.1, SD2:6.6, SD3:7.5 },
  { m:3,  SD3neg:4.0, SD2neg:4.5, SD0:5.8, SD2:7.5, SD3:8.5 },
  { m:4,  SD3neg:4.4, SD2neg:5.0, SD0:6.4, SD2:8.1, SD3:9.3 },
  { m:5,  SD3neg:4.8, SD2neg:5.4, SD0:6.9, SD2:8.8, SD3:9.9 },
  { m:6,  SD3neg:5.1, SD2neg:5.8, SD0:7.3, SD2:9.3, SD3:10.4 },
  { m:7,  SD3neg:5.4, SD2neg:6.1, SD0:7.6, SD2:9.8, SD3:10.9 },
  { m:8,  SD3neg:5.6, SD2neg:6.3, SD0:7.9, SD2:10.1, SD3:11.3 },
  { m:9,  SD3neg:5.8, SD2neg:6.6, SD0:8.2, SD2:10.5, SD3:11.8 },
  { m:10, SD3neg:6.0, SD2neg:6.8, SD0:8.5, SD2:10.9, SD3:12.2 },
  { m:11, SD3neg:6.2, SD2neg:7.0, SD0:8.7, SD2:11.2, SD3:12.6 },
  { m:12, SD3neg:6.3, SD2neg:7.1, SD0:8.9, SD2:11.5, SD3:12.9 },
  { m:13, SD3neg:6.5, SD2neg:7.3, SD0:9.2, SD2:11.8, SD3:13.3 },
  { m:14, SD3neg:6.6, SD2neg:7.5, SD0:9.4, SD2:12.1, SD3:13.7 },
  { m:15, SD3neg:6.8, SD2neg:7.7, SD0:9.6, SD2:12.4, SD3:14.0 },
  { m:16, SD3neg:6.9, SD2neg:7.8, SD0:9.8, SD2:12.7, SD3:14.3 },
  { m:17, SD3neg:7.0, SD2neg:8.0, SD0:10.0, SD2:12.9, SD3:14.6 },
  { m:18, SD3neg:7.2, SD2neg:8.1, SD0:10.2, SD2:13.2, SD3:14.9 },
  { m:19, SD3neg:7.3, SD2neg:8.3, SD0:10.4, SD2:13.5, SD3:15.2 },
  { m:20, SD3neg:7.5, SD2neg:8.5, SD0:10.6, SD2:13.7, SD3:15.5 },
  { m:21, SD3neg:7.6, SD2neg:8.6, SD0:10.9, SD2:14.0, SD3:15.8 },
  { m:22, SD3neg:7.7, SD2neg:8.8, SD0:11.1, SD2:14.3, SD3:16.2 },
  { m:23, SD3neg:7.9, SD2neg:9.0, SD0:11.3, SD2:14.6, SD3:16.5 },
  { m:24, SD3neg:8.0, SD2neg:9.1, SD0:11.5, SD2:14.8, SD3:16.8 },
  { m:25, SD3neg:8.1, SD2neg:9.3, SD0:11.7, SD2:15.1, SD3:17.1 },
  { m:26, SD3neg:8.3, SD2neg:9.4, SD0:11.9, SD2:15.4, SD3:17.4 },
  { m:27, SD3neg:8.4, SD2neg:9.6, SD0:12.1, SD2:15.7, SD3:17.8 },
  { m:28, SD3neg:8.5, SD2neg:9.7, SD0:12.3, SD2:15.9, SD3:18.1 },
  { m:29, SD3neg:8.6, SD2neg:9.9, SD0:12.5, SD2:16.2, SD3:18.4 },
  { m:30, SD3neg:8.8, SD2neg:10.0, SD0:12.7, SD2:16.4, SD3:18.7 },
  { m:31, SD3neg:8.9, SD2neg:10.2, SD0:12.9, SD2:16.7, SD3:19.0 },
  { m:32, SD3neg:9.0, SD2neg:10.3, SD0:13.1, SD2:17.0, SD3:19.3 },
  { m:33, SD3neg:9.1, SD2neg:10.4, SD0:13.3, SD2:17.2, SD3:19.6 },
  { m:34, SD3neg:9.2, SD2neg:10.6, SD0:13.5, SD2:17.5, SD3:19.9 },
  { m:35, SD3neg:9.3, SD2neg:10.7, SD0:13.7, SD2:17.7, SD3:20.2 },
  { m:36, SD3neg:9.4, SD2neg:10.8, SD0:13.9, SD2:18.0, SD3:20.5 },
  { m:37, SD3neg:9.5, SD2neg:11.0, SD0:14.0, SD2:18.2, SD3:20.8 },
  { m:38, SD3neg:9.6, SD2neg:11.1, SD0:14.2, SD2:18.5, SD3:21.1 },
  { m:39, SD3neg:9.7, SD2neg:11.2, SD0:14.4, SD2:18.7, SD3:21.4 },
  { m:40, SD3neg:9.8, SD2neg:11.3, SD0:14.6, SD2:19.0, SD3:21.7 },
  { m:41, SD3neg:9.9, SD2neg:11.5, SD0:14.8, SD2:19.2, SD3:22.0 },
  { m:42, SD3neg:10.0, SD2neg:11.6, SD0:15.0, SD2:19.5, SD3:22.3 },
  { m:43, SD3neg:10.1, SD2neg:11.7, SD0:15.2, SD2:19.7, SD3:22.6 },
  { m:44, SD3neg:10.2, SD2neg:11.8, SD0:15.3, SD2:20.0, SD3:22.9 },
  { m:45, SD3neg:10.3, SD2neg:12.0, SD0:15.5, SD2:20.2, SD3:23.2 },
  { m:46, SD3neg:10.4, SD2neg:12.1, SD0:15.7, SD2:20.5, SD3:23.5 },
  { m:47, SD3neg:10.5, SD2neg:12.2, SD0:15.9, SD2:20.7, SD3:23.8 },
  { m:48, SD3neg:10.6, SD2neg:12.3, SD0:16.1, SD2:21.0, SD3:24.2 },
  { m:49, SD3neg:10.7, SD2neg:12.4, SD0:16.3, SD2:21.2, SD3:24.5 },
  { m:50, SD3neg:10.8, SD2neg:12.6, SD0:16.5, SD2:21.5, SD3:24.8 },
  { m:51, SD3neg:10.9, SD2neg:12.7, SD0:16.7, SD2:21.7, SD3:25.1 },
  { m:52, SD3neg:11.0, SD2neg:12.8, SD0:16.9, SD2:22.0, SD3:25.4 },
  { m:53, SD3neg:11.1, SD2neg:12.9, SD0:17.1, SD2:22.3, SD3:25.8 },
  { m:54, SD3neg:11.2, SD2neg:13.0, SD0:17.3, SD2:22.5, SD3:26.1 },
  { m:55, SD3neg:11.3, SD2neg:13.2, SD0:17.5, SD2:22.8, SD3:26.4 },
  { m:56, SD3neg:11.4, SD2neg:13.3, SD0:17.7, SD2:23.0, SD3:26.7 },
  { m:57, SD3neg:11.5, SD2neg:13.4, SD0:17.9, SD2:23.3, SD3:27.1 },
  { m:58, SD3neg:11.6, SD2neg:13.5, SD0:18.1, SD2:23.5, SD3:27.4 },
  { m:59, SD3neg:11.7, SD2neg:13.6, SD0:18.3, SD2:23.8, SD3:27.7 },
  { m:60, SD3neg:11.8, SD2neg:13.7, SD0:18.5, SD2:24.0, SD3:28.0 },
]

const WHO_LHFA_BOYS = [
  { x:0, SD3neg:44.2, SD2neg:46.1, SD0:49.9, SD2:53.7, SD3:55.6 },
  { x:1, SD3neg:48.9, SD2neg:50.8, SD0:54.7, SD2:58.6, SD3:60.6 },
  { x:2, SD3neg:52.4, SD2neg:54.4, SD0:58.4, SD2:62.4, SD3:64.4 },
  { x:3, SD3neg:55.3, SD2neg:57.3, SD0:61.4, SD2:65.5, SD3:67.6 },
  { x:4, SD3neg:57.6, SD2neg:59.7, SD0:63.9, SD2:68.0, SD3:70.1 },
  { x:5, SD3neg:59.6, SD2neg:61.7, SD0:65.9, SD2:70.1, SD3:72.2 },
  { x:6, SD3neg:61.2, SD2neg:63.3, SD0:67.6, SD2:71.9, SD3:74.0 },
  { x:7, SD3neg:62.7, SD2neg:64.8, SD0:69.2, SD2:73.5, SD3:75.7 },
  { x:8, SD3neg:64.0, SD2neg:66.2, SD0:70.6, SD2:75.0, SD3:77.2 },
  { x:9, SD3neg:65.2, SD2neg:67.5, SD0:72.0, SD2:76.5, SD3:78.7 },
  { x:10, SD3neg:66.4, SD2neg:68.7, SD0:73.3, SD2:77.9, SD3:80.1 },
  { x:11, SD3neg:67.6, SD2neg:69.9, SD0:74.5, SD2:79.2, SD3:81.5 },
  { x:12, SD3neg:68.6, SD2neg:71.0, SD0:75.7, SD2:80.5, SD3:82.9 },
  { x:13, SD3neg:69.6, SD2neg:72.1, SD0:76.9, SD2:81.8, SD3:84.2 },
  { x:14, SD3neg:70.6, SD2neg:73.1, SD0:78.0, SD2:83.0, SD3:85.5 },
  { x:15, SD3neg:71.6, SD2neg:74.1, SD0:79.1, SD2:84.2, SD3:86.7 },
  { x:16, SD3neg:72.5, SD2neg:75.0, SD0:80.2, SD2:85.4, SD3:88.0 },
  { x:17, SD3neg:73.3, SD2neg:76.0, SD0:81.2, SD2:86.5, SD3:89.2 },
  { x:18, SD3neg:74.2, SD2neg:76.9, SD0:82.3, SD2:87.7, SD3:90.4 },
  { x:19, SD3neg:75.0, SD2neg:77.7, SD0:83.2, SD2:88.8, SD3:91.5 },
  { x:20, SD3neg:75.8, SD2neg:78.6, SD0:84.2, SD2:89.8, SD3:92.6 },
  { x:21, SD3neg:76.5, SD2neg:79.4, SD0:85.1, SD2:90.9, SD3:93.8 },
  { x:22, SD3neg:77.2, SD2neg:80.2, SD0:86.0, SD2:91.9, SD3:94.9 },
  { x:23, SD3neg:78.0, SD2neg:81.0, SD0:86.9, SD2:92.9, SD3:95.9 },
  { x:24, SD3neg:78.0, SD2neg:81.0, SD0:87.1, SD2:93.2, SD3:96.3 },
  { x:25, SD3neg:78.6, SD2neg:81.7, SD0:88.0, SD2:94.2, SD3:97.3 },
  { x:26, SD3neg:79.3, SD2neg:82.5, SD0:88.8, SD2:95.2, SD3:98.3 },
  { x:27, SD3neg:79.9, SD2neg:83.1, SD0:89.6, SD2:96.1, SD3:99.3 },
  { x:28, SD3neg:80.5, SD2neg:83.8, SD0:90.4, SD2:97.0, SD3:100.3 },
  { x:29, SD3neg:81.1, SD2neg:84.5, SD0:91.2, SD2:97.9, SD3:101.2 },
  { x:30, SD3neg:81.7, SD2neg:85.1, SD0:91.9, SD2:98.7, SD3:102.1 },
  { x:31, SD3neg:82.3, SD2neg:85.7, SD0:92.7, SD2:99.6, SD3:103.0 },
  { x:32, SD3neg:82.8, SD2neg:86.4, SD0:93.4, SD2:100.4, SD3:103.9 },
  { x:33, SD3neg:83.4, SD2neg:86.9, SD0:94.1, SD2:101.2, SD3:104.8 },
  { x:34, SD3neg:83.9, SD2neg:87.5, SD0:94.8, SD2:102.0, SD3:105.6 },
  { x:35, SD3neg:84.4, SD2neg:88.1, SD0:95.4, SD2:102.7, SD3:106.4 },
  { x:36, SD3neg:85.0, SD2neg:88.7, SD0:96.1, SD2:103.5, SD3:107.2 },
  { x:37, SD3neg:85.5, SD2neg:89.2, SD0:96.7, SD2:104.2, SD3:108.0 },
  { x:38, SD3neg:86.0, SD2neg:89.8, SD0:97.4, SD2:105.0, SD3:108.8 },
  { x:39, SD3neg:86.5, SD2neg:90.3, SD0:98.0, SD2:105.7, SD3:109.5 },
  { x:40, SD3neg:87.0, SD2neg:90.9, SD0:98.6, SD2:106.4, SD3:110.3 },
  { x:41, SD3neg:87.5, SD2neg:91.4, SD0:99.2, SD2:107.1, SD3:111.0 },
  { x:42, SD3neg:88.0, SD2neg:91.9, SD0:99.9, SD2:107.8, SD3:111.7 },
  { x:43, SD3neg:88.4, SD2neg:92.4, SD0:100.4, SD2:108.5, SD3:112.5 },
  { x:44, SD3neg:88.9, SD2neg:93.0, SD0:101.0, SD2:109.1, SD3:113.2 },
  { x:45, SD3neg:89.4, SD2neg:93.5, SD0:101.6, SD2:109.8, SD3:113.9 },
  { x:46, SD3neg:89.8, SD2neg:94.0, SD0:102.2, SD2:110.4, SD3:114.6 },
  { x:47, SD3neg:90.3, SD2neg:94.4, SD0:102.8, SD2:111.1, SD3:115.2 },
  { x:48, SD3neg:90.7, SD2neg:94.9, SD0:103.3, SD2:111.7, SD3:115.9 },
  { x:49, SD3neg:91.2, SD2neg:95.4, SD0:103.9, SD2:112.4, SD3:116.6 },
  { x:50, SD3neg:91.6, SD2neg:95.9, SD0:104.4, SD2:113.0, SD3:117.3 },
  { x:51, SD3neg:92.1, SD2neg:96.4, SD0:105.0, SD2:113.6, SD3:117.9 },
  { x:52, SD3neg:92.5, SD2neg:96.9, SD0:105.6, SD2:114.2, SD3:118.6 },
  { x:53, SD3neg:93.0, SD2neg:97.4, SD0:106.1, SD2:114.9, SD3:119.2 },
  { x:54, SD3neg:93.4, SD2neg:97.8, SD0:106.7, SD2:115.5, SD3:119.9 },
  { x:55, SD3neg:93.9, SD2neg:98.3, SD0:107.2, SD2:116.1, SD3:120.6 },
  { x:56, SD3neg:94.3, SD2neg:98.8, SD0:107.8, SD2:116.7, SD3:121.2 },
  { x:57, SD3neg:94.7, SD2neg:99.3, SD0:108.3, SD2:117.4, SD3:121.9 },
  { x:58, SD3neg:95.2, SD2neg:99.7, SD0:108.9, SD2:118.0, SD3:122.6 },
  { x:59, SD3neg:95.6, SD2neg:100.2, SD0:109.4, SD2:118.6, SD3:123.2 },
  { x:60, SD3neg:96.1, SD2neg:100.7, SD0:110.0, SD2:119.2, SD3:123.9 },
]

const WHO_LHFA_GIRLS = [
  { x:0, SD3neg:43.6, SD2neg:45.4, SD0:49.1, SD2:52.9, SD3:54.7 },
  { x:1, SD3neg:47.8, SD2neg:49.8, SD0:53.7, SD2:57.6, SD3:59.5 },
  { x:2, SD3neg:51.0, SD2neg:53.0, SD0:57.1, SD2:61.1, SD3:63.2 },
  { x:3, SD3neg:53.5, SD2neg:55.6, SD0:59.8, SD2:64.0, SD3:66.1 },
  { x:4, SD3neg:55.6, SD2neg:57.8, SD0:62.1, SD2:66.4, SD3:68.6 },
  { x:5, SD3neg:57.4, SD2neg:59.6, SD0:64.0, SD2:68.5, SD3:70.7 },
  { x:6, SD3neg:58.9, SD2neg:61.2, SD0:65.7, SD2:70.3, SD3:72.5 },
  { x:7, SD3neg:60.3, SD2neg:62.7, SD0:67.3, SD2:71.9, SD3:74.2 },
  { x:8, SD3neg:61.7, SD2neg:64.0, SD0:68.7, SD2:73.5, SD3:75.8 },
  { x:9, SD3neg:62.9, SD2neg:65.3, SD0:70.1, SD2:75.0, SD3:77.4 },
  { x:10, SD3neg:64.1, SD2neg:66.5, SD0:71.5, SD2:76.4, SD3:78.9 },
  { x:11, SD3neg:65.2, SD2neg:67.7, SD0:72.8, SD2:77.8, SD3:80.3 },
  { x:12, SD3neg:66.3, SD2neg:68.9, SD0:74.0, SD2:79.2, SD3:81.7 },
  { x:13, SD3neg:67.3, SD2neg:70.0, SD0:75.2, SD2:80.5, SD3:83.1 },
  { x:14, SD3neg:68.3, SD2neg:71.0, SD0:76.4, SD2:81.7, SD3:84.4 },
  { x:15, SD3neg:69.3, SD2neg:72.0, SD0:77.5, SD2:83.0, SD3:85.7 },
  { x:16, SD3neg:70.2, SD2neg:73.0, SD0:78.6, SD2:84.2, SD3:87.0 },
  { x:17, SD3neg:71.1, SD2neg:74.0, SD0:79.7, SD2:85.4, SD3:88.2 },
  { x:18, SD3neg:72.0, SD2neg:74.9, SD0:80.7, SD2:86.5, SD3:89.4 },
  { x:19, SD3neg:72.8, SD2neg:75.8, SD0:81.7, SD2:87.6, SD3:90.6 },
  { x:20, SD3neg:73.7, SD2neg:76.7, SD0:82.7, SD2:88.7, SD3:91.7 },
  { x:21, SD3neg:74.5, SD2neg:77.5, SD0:83.7, SD2:89.8, SD3:92.9 },
  { x:22, SD3neg:75.2, SD2neg:78.4, SD0:84.6, SD2:90.8, SD3:94.0 },
  { x:23, SD3neg:76.0, SD2neg:79.2, SD0:85.5, SD2:91.9, SD3:95.0 },
  { x:24, SD3neg:76.0, SD2neg:79.3, SD0:85.7, SD2:92.2, SD3:95.4 },
  { x:25, SD3neg:76.8, SD2neg:80.0, SD0:86.6, SD2:93.1, SD3:96.4 },
  { x:26, SD3neg:77.5, SD2neg:80.8, SD0:87.4, SD2:94.1, SD3:97.4 },
  { x:27, SD3neg:78.1, SD2neg:81.5, SD0:88.3, SD2:95.0, SD3:98.4 },
  { x:28, SD3neg:78.8, SD2neg:82.2, SD0:89.1, SD2:96.0, SD3:99.4 },
  { x:29, SD3neg:79.5, SD2neg:82.9, SD0:89.9, SD2:96.9, SD3:100.3 },
  { x:30, SD3neg:80.1, SD2neg:83.6, SD0:90.7, SD2:97.7, SD3:101.3 },
  { x:31, SD3neg:80.7, SD2neg:84.3, SD0:91.4, SD2:98.6, SD3:102.2 },
  { x:32, SD3neg:81.3, SD2neg:84.9, SD0:92.2, SD2:99.4, SD3:103.1 },
  { x:33, SD3neg:81.9, SD2neg:85.6, SD0:92.9, SD2:100.3, SD3:103.9 },
  { x:34, SD3neg:82.5, SD2neg:86.2, SD0:93.6, SD2:101.1, SD3:104.8 },
  { x:35, SD3neg:83.1, SD2neg:86.8, SD0:94.4, SD2:101.9, SD3:105.6 },
  { x:36, SD3neg:83.6, SD2neg:87.4, SD0:95.1, SD2:102.7, SD3:106.5 },
  { x:37, SD3neg:84.2, SD2neg:88.0, SD0:95.7, SD2:103.4, SD3:107.3 },
  { x:38, SD3neg:84.7, SD2neg:88.6, SD0:96.4, SD2:104.2, SD3:108.1 },
  { x:39, SD3neg:85.3, SD2neg:89.2, SD0:97.1, SD2:105.0, SD3:108.9 },
  { x:40, SD3neg:85.8, SD2neg:89.8, SD0:97.7, SD2:105.7, SD3:109.7 },
  { x:41, SD3neg:86.3, SD2neg:90.4, SD0:98.4, SD2:106.4, SD3:110.5 },
  { x:42, SD3neg:86.8, SD2neg:90.9, SD0:99.0, SD2:107.2, SD3:111.2 },
  { x:43, SD3neg:87.4, SD2neg:91.5, SD0:99.7, SD2:107.9, SD3:112.0 },
  { x:44, SD3neg:87.9, SD2neg:92.0, SD0:100.3, SD2:108.6, SD3:112.7 },
  { x:45, SD3neg:88.4, SD2neg:92.5, SD0:100.9, SD2:109.3, SD3:113.5 },
  { x:46, SD3neg:88.9, SD2neg:93.1, SD0:101.5, SD2:110.0, SD3:114.2 },
  { x:47, SD3neg:89.3, SD2neg:93.6, SD0:102.1, SD2:110.7, SD3:114.9 },
  { x:48, SD3neg:89.8, SD2neg:94.1, SD0:102.7, SD2:111.3, SD3:115.7 },
  { x:49, SD3neg:90.3, SD2neg:94.6, SD0:103.3, SD2:112.0, SD3:116.4 },
  { x:50, SD3neg:90.7, SD2neg:95.1, SD0:103.9, SD2:112.7, SD3:117.1 },
  { x:51, SD3neg:91.2, SD2neg:95.6, SD0:104.5, SD2:113.3, SD3:117.7 },
  { x:52, SD3neg:91.7, SD2neg:96.1, SD0:105.0, SD2:114.0, SD3:118.4 },
  { x:53, SD3neg:92.1, SD2neg:96.6, SD0:105.6, SD2:114.6, SD3:119.1 },
  { x:54, SD3neg:92.6, SD2neg:97.1, SD0:106.2, SD2:115.2, SD3:119.8 },
  { x:55, SD3neg:93.0, SD2neg:97.6, SD0:106.7, SD2:115.9, SD3:120.4 },
  { x:56, SD3neg:93.4, SD2neg:98.1, SD0:107.3, SD2:116.5, SD3:121.1 },
  { x:57, SD3neg:93.9, SD2neg:98.5, SD0:107.8, SD2:117.1, SD3:121.8 },
  { x:58, SD3neg:94.3, SD2neg:99.0, SD0:108.4, SD2:117.7, SD3:122.4 },
  { x:59, SD3neg:94.7, SD2neg:99.5, SD0:108.9, SD2:118.3, SD3:123.1 },
  { x:60, SD3neg:95.2, SD2neg:99.9, SD0:109.4, SD2:118.9, SD3:123.7 },
]

const WHO_WFL_BOYS = [
  { x:45, SD3neg:1.9, SD2neg:2.0, SD0:2.4, SD2:3.0, SD3:3.3 },
  { x:45.5, SD3neg:1.9, SD2neg:2.1, SD0:2.5, SD2:3.1, SD3:3.4 },
  { x:46, SD3neg:2.0, SD2neg:2.2, SD0:2.6, SD2:3.1, SD3:3.5 },
  { x:46.5, SD3neg:2.1, SD2neg:2.3, SD0:2.7, SD2:3.2, SD3:3.6 },
  { x:47, SD3neg:2.1, SD2neg:2.3, SD0:2.8, SD2:3.3, SD3:3.7 },
  { x:47.5, SD3neg:2.2, SD2neg:2.4, SD0:2.9, SD2:3.4, SD3:3.8 },
  { x:48, SD3neg:2.3, SD2neg:2.5, SD0:2.9, SD2:3.6, SD3:3.9 },
  { x:48.5, SD3neg:2.3, SD2neg:2.6, SD0:3.0, SD2:3.7, SD3:4.0 },
  { x:49, SD3neg:2.4, SD2neg:2.6, SD0:3.1, SD2:3.8, SD3:4.2 },
  { x:49.5, SD3neg:2.5, SD2neg:2.7, SD0:3.2, SD2:3.9, SD3:4.3 },
  { x:50, SD3neg:2.6, SD2neg:2.8, SD0:3.3, SD2:4.0, SD3:4.4 },
  { x:50.5, SD3neg:2.7, SD2neg:2.9, SD0:3.4, SD2:4.1, SD3:4.5 },
  { x:51, SD3neg:2.7, SD2neg:3.0, SD0:3.5, SD2:4.2, SD3:4.7 },
  { x:51.5, SD3neg:2.8, SD2neg:3.1, SD0:3.6, SD2:4.4, SD3:4.8 },
  { x:52, SD3neg:2.9, SD2neg:3.2, SD0:3.8, SD2:4.5, SD3:5.0 },
  { x:52.5, SD3neg:3.0, SD2neg:3.3, SD0:3.9, SD2:4.6, SD3:5.1 },
  { x:53, SD3neg:3.1, SD2neg:3.4, SD0:4.0, SD2:4.8, SD3:5.3 },
  { x:53.5, SD3neg:3.2, SD2neg:3.5, SD0:4.1, SD2:4.9, SD3:5.4 },
  { x:54, SD3neg:3.3, SD2neg:3.6, SD0:4.3, SD2:5.1, SD3:5.6 },
  { x:54.5, SD3neg:3.4, SD2neg:3.7, SD0:4.4, SD2:5.3, SD3:5.8 },
  { x:55, SD3neg:3.6, SD2neg:3.8, SD0:4.5, SD2:5.4, SD3:6.0 },
  { x:55.5, SD3neg:3.7, SD2neg:4.0, SD0:4.7, SD2:5.6, SD3:6.1 },
  { x:56, SD3neg:3.8, SD2neg:4.1, SD0:4.8, SD2:5.8, SD3:6.3 },
  { x:56.5, SD3neg:3.9, SD2neg:4.2, SD0:5.0, SD2:5.9, SD3:6.5 },
  { x:57, SD3neg:4.0, SD2neg:4.3, SD0:5.1, SD2:6.1, SD3:6.7 },
  { x:57.5, SD3neg:4.1, SD2neg:4.5, SD0:5.3, SD2:6.3, SD3:6.9 },
  { x:58, SD3neg:4.3, SD2neg:4.6, SD0:5.4, SD2:6.4, SD3:7.1 },
  { x:58.5, SD3neg:4.4, SD2neg:4.7, SD0:5.6, SD2:6.6, SD3:7.2 },
  { x:59, SD3neg:4.5, SD2neg:4.8, SD0:5.7, SD2:6.8, SD3:7.4 },
  { x:59.5, SD3neg:4.6, SD2neg:5.0, SD0:5.9, SD2:7.0, SD3:7.6 },
  { x:60, SD3neg:4.7, SD2neg:5.1, SD0:6.0, SD2:7.1, SD3:7.8 },
  { x:60.5, SD3neg:4.8, SD2neg:5.2, SD0:6.1, SD2:7.3, SD3:8.0 },
  { x:61, SD3neg:4.9, SD2neg:5.3, SD0:6.3, SD2:7.4, SD3:8.1 },
  { x:61.5, SD3neg:5.0, SD2neg:5.4, SD0:6.4, SD2:7.6, SD3:8.3 },
  { x:62, SD3neg:5.1, SD2neg:5.6, SD0:6.5, SD2:7.7, SD3:8.5 },
  { x:62.5, SD3neg:5.2, SD2neg:5.7, SD0:6.7, SD2:7.9, SD3:8.6 },
  { x:63, SD3neg:5.3, SD2neg:5.8, SD0:6.8, SD2:8.0, SD3:8.8 },
  { x:63.5, SD3neg:5.4, SD2neg:5.9, SD0:6.9, SD2:8.2, SD3:8.9 },
  { x:64, SD3neg:5.5, SD2neg:6.0, SD0:7.0, SD2:8.3, SD3:9.1 },
  { x:64.5, SD3neg:5.6, SD2neg:6.1, SD0:7.1, SD2:8.5, SD3:9.3 },
  { x:65, SD3neg:5.7, SD2neg:6.2, SD0:7.3, SD2:8.6, SD3:9.4 },
  { x:65.5, SD3neg:5.8, SD2neg:6.3, SD0:7.4, SD2:8.7, SD3:9.6 },
  { x:66, SD3neg:5.9, SD2neg:6.4, SD0:7.5, SD2:8.9, SD3:9.7 },
  { x:66.5, SD3neg:6.0, SD2neg:6.5, SD0:7.6, SD2:9.0, SD3:9.9 },
  { x:67, SD3neg:6.1, SD2neg:6.6, SD0:7.7, SD2:9.2, SD3:10.0 },
  { x:67.5, SD3neg:6.2, SD2neg:6.7, SD0:7.9, SD2:9.3, SD3:10.2 },
  { x:68, SD3neg:6.3, SD2neg:6.8, SD0:8.0, SD2:9.4, SD3:10.3 },
  { x:68.5, SD3neg:6.4, SD2neg:6.9, SD0:8.1, SD2:9.6, SD3:10.5 },
  { x:69, SD3neg:6.5, SD2neg:7.0, SD0:8.2, SD2:9.7, SD3:10.6 },
  { x:69.5, SD3neg:6.6, SD2neg:7.1, SD0:8.3, SD2:9.8, SD3:10.8 },
  { x:70, SD3neg:6.6, SD2neg:7.2, SD0:8.4, SD2:10.0, SD3:10.9 },
  { x:70.5, SD3neg:6.7, SD2neg:7.3, SD0:8.5, SD2:10.1, SD3:11.1 },
  { x:71, SD3neg:6.8, SD2neg:7.4, SD0:8.6, SD2:10.2, SD3:11.2 },
  { x:71.5, SD3neg:6.9, SD2neg:7.5, SD0:8.8, SD2:10.4, SD3:11.3 },
  { x:72, SD3neg:7.0, SD2neg:7.6, SD0:8.9, SD2:10.5, SD3:11.5 },
  { x:72.5, SD3neg:7.1, SD2neg:7.6, SD0:9.0, SD2:10.6, SD3:11.6 },
  { x:73, SD3neg:7.2, SD2neg:7.7, SD0:9.1, SD2:10.8, SD3:11.8 },
  { x:73.5, SD3neg:7.2, SD2neg:7.8, SD0:9.2, SD2:10.9, SD3:11.9 },
  { x:74, SD3neg:7.3, SD2neg:7.9, SD0:9.3, SD2:11.0, SD3:12.1 },
  { x:74.5, SD3neg:7.4, SD2neg:8.0, SD0:9.4, SD2:11.2, SD3:12.2 },
  { x:75, SD3neg:7.5, SD2neg:8.1, SD0:9.5, SD2:11.3, SD3:12.3 },
  { x:75.5, SD3neg:7.6, SD2neg:8.2, SD0:9.6, SD2:11.4, SD3:12.5 },
  { x:76, SD3neg:7.6, SD2neg:8.3, SD0:9.7, SD2:11.5, SD3:12.6 },
  { x:76.5, SD3neg:7.7, SD2neg:8.3, SD0:9.8, SD2:11.6, SD3:12.7 },
  { x:77, SD3neg:7.8, SD2neg:8.4, SD0:9.9, SD2:11.7, SD3:12.8 },
  { x:77.5, SD3neg:7.9, SD2neg:8.5, SD0:10.0, SD2:11.9, SD3:13.0 },
  { x:78, SD3neg:7.9, SD2neg:8.6, SD0:10.1, SD2:12.0, SD3:13.1 },
  { x:78.5, SD3neg:8.0, SD2neg:8.7, SD0:10.2, SD2:12.1, SD3:13.2 },
  { x:79, SD3neg:8.1, SD2neg:8.7, SD0:10.3, SD2:12.2, SD3:13.3 },
  { x:79.5, SD3neg:8.2, SD2neg:8.8, SD0:10.4, SD2:12.3, SD3:13.4 },
  { x:80, SD3neg:8.2, SD2neg:8.9, SD0:10.4, SD2:12.4, SD3:13.6 },
  { x:80.5, SD3neg:8.3, SD2neg:9.0, SD0:10.5, SD2:12.5, SD3:13.7 },
  { x:81, SD3neg:8.4, SD2neg:9.1, SD0:10.6, SD2:12.6, SD3:13.8 },
  { x:81.5, SD3neg:8.5, SD2neg:9.1, SD0:10.7, SD2:12.7, SD3:13.9 },
  { x:82, SD3neg:8.5, SD2neg:9.2, SD0:10.8, SD2:12.8, SD3:14.0 },
  { x:82.5, SD3neg:8.6, SD2neg:9.3, SD0:10.9, SD2:13.0, SD3:14.2 },
  { x:83, SD3neg:8.7, SD2neg:9.4, SD0:11.0, SD2:13.1, SD3:14.3 },
  { x:83.5, SD3neg:8.8, SD2neg:9.5, SD0:11.2, SD2:13.2, SD3:14.4 },
  { x:84, SD3neg:8.9, SD2neg:9.6, SD0:11.3, SD2:13.3, SD3:14.6 },
  { x:84.5, SD3neg:9.0, SD2neg:9.7, SD0:11.4, SD2:13.5, SD3:14.7 },
  { x:85, SD3neg:9.1, SD2neg:9.8, SD0:11.5, SD2:13.6, SD3:14.9 },
  { x:85.5, SD3neg:9.2, SD2neg:9.9, SD0:11.6, SD2:13.7, SD3:15.0 },
  { x:86, SD3neg:9.3, SD2neg:10.0, SD0:11.7, SD2:13.9, SD3:15.2 },
  { x:86.5, SD3neg:9.4, SD2neg:10.1, SD0:11.9, SD2:14.0, SD3:15.3 },
  { x:87, SD3neg:9.5, SD2neg:10.2, SD0:12.0, SD2:14.2, SD3:15.5 },
  { x:87.5, SD3neg:9.6, SD2neg:10.4, SD0:12.1, SD2:14.3, SD3:15.6 },
  { x:88, SD3neg:9.7, SD2neg:10.5, SD0:12.2, SD2:14.5, SD3:15.8 },
  { x:88.5, SD3neg:9.8, SD2neg:10.6, SD0:12.4, SD2:14.6, SD3:15.9 },
  { x:89, SD3neg:9.9, SD2neg:10.7, SD0:12.5, SD2:14.7, SD3:16.1 },
  { x:89.5, SD3neg:10.0, SD2neg:10.8, SD0:12.6, SD2:14.9, SD3:16.2 },
  { x:90, SD3neg:10.1, SD2neg:10.9, SD0:12.7, SD2:15.0, SD3:16.4 },
  { x:90.5, SD3neg:10.2, SD2neg:11.0, SD0:12.8, SD2:15.1, SD3:16.5 },
  { x:91, SD3neg:10.3, SD2neg:11.1, SD0:13.0, SD2:15.3, SD3:16.7 },
  { x:91.5, SD3neg:10.4, SD2neg:11.2, SD0:13.1, SD2:15.4, SD3:16.8 },
  { x:92, SD3neg:10.5, SD2neg:11.3, SD0:13.2, SD2:15.6, SD3:17.0 },
  { x:92.5, SD3neg:10.6, SD2neg:11.4, SD0:13.3, SD2:15.7, SD3:17.1 },
  { x:93, SD3neg:10.7, SD2neg:11.5, SD0:13.4, SD2:15.8, SD3:17.3 },
  { x:93.5, SD3neg:10.7, SD2neg:11.6, SD0:13.5, SD2:16.0, SD3:17.4 },
  { x:94, SD3neg:10.8, SD2neg:11.7, SD0:13.7, SD2:16.1, SD3:17.6 },
  { x:94.5, SD3neg:10.9, SD2neg:11.8, SD0:13.8, SD2:16.3, SD3:17.7 },
  { x:95, SD3neg:11.0, SD2neg:11.9, SD0:13.9, SD2:16.4, SD3:17.9 },
  { x:95.5, SD3neg:11.1, SD2neg:12.0, SD0:14.0, SD2:16.5, SD3:18.0 },
  { x:96, SD3neg:11.2, SD2neg:12.1, SD0:14.1, SD2:16.7, SD3:18.2 },
  { x:96.5, SD3neg:11.3, SD2neg:12.2, SD0:14.3, SD2:16.8, SD3:18.4 },
  { x:97, SD3neg:11.4, SD2neg:12.3, SD0:14.4, SD2:17.0, SD3:18.5 },
  { x:97.5, SD3neg:11.5, SD2neg:12.4, SD0:14.5, SD2:17.1, SD3:18.7 },
  { x:98, SD3neg:11.6, SD2neg:12.5, SD0:14.6, SD2:17.3, SD3:18.9 },
  { x:98.5, SD3neg:11.7, SD2neg:12.6, SD0:14.8, SD2:17.5, SD3:19.1 },
  { x:99, SD3neg:11.8, SD2neg:12.7, SD0:14.9, SD2:17.6, SD3:19.2 },
  { x:99.5, SD3neg:11.9, SD2neg:12.8, SD0:15.0, SD2:17.8, SD3:19.4 },
  { x:100, SD3neg:12.0, SD2neg:12.9, SD0:15.2, SD2:18.0, SD3:19.6 },
  { x:100.5, SD3neg:12.1, SD2neg:13.0, SD0:15.3, SD2:18.1, SD3:19.8 },
  { x:101, SD3neg:12.2, SD2neg:13.2, SD0:15.4, SD2:18.3, SD3:20.0 },
  { x:101.5, SD3neg:12.3, SD2neg:13.3, SD0:15.6, SD2:18.5, SD3:20.2 },
  { x:102, SD3neg:12.4, SD2neg:13.4, SD0:15.7, SD2:18.7, SD3:20.4 },
  { x:102.5, SD3neg:12.5, SD2neg:13.5, SD0:15.9, SD2:18.8, SD3:20.6 },
  { x:103, SD3neg:12.6, SD2neg:13.6, SD0:16.0, SD2:19.0, SD3:20.8 },
  { x:103.5, SD3neg:12.7, SD2neg:13.7, SD0:16.2, SD2:19.2, SD3:21.0 },
  { x:104, SD3neg:12.8, SD2neg:13.9, SD0:16.3, SD2:19.4, SD3:21.2 },
  { x:104.5, SD3neg:12.9, SD2neg:14.0, SD0:16.5, SD2:19.6, SD3:21.5 },
  { x:105, SD3neg:13.0, SD2neg:14.1, SD0:16.6, SD2:19.8, SD3:21.7 },
  { x:105.5, SD3neg:13.2, SD2neg:14.2, SD0:16.8, SD2:20.0, SD3:21.9 },
  { x:106, SD3neg:13.3, SD2neg:14.4, SD0:16.9, SD2:20.2, SD3:22.1 },
  { x:106.5, SD3neg:13.4, SD2neg:14.5, SD0:17.1, SD2:20.4, SD3:22.4 },
  { x:107, SD3neg:13.5, SD2neg:14.6, SD0:17.3, SD2:20.6, SD3:22.6 },
  { x:107.5, SD3neg:13.6, SD2neg:14.7, SD0:17.4, SD2:20.8, SD3:22.8 },
  { x:108, SD3neg:13.7, SD2neg:14.9, SD0:17.6, SD2:21.0, SD3:23.1 },
  { x:108.5, SD3neg:13.8, SD2neg:15.0, SD0:17.8, SD2:21.2, SD3:23.3 },
  { x:109, SD3neg:14.0, SD2neg:15.1, SD0:17.9, SD2:21.4, SD3:23.6 },
  { x:109.5, SD3neg:14.1, SD2neg:15.3, SD0:18.1, SD2:21.7, SD3:23.8 },
  { x:110, SD3neg:14.2, SD2neg:15.4, SD0:18.3, SD2:21.9, SD3:24.1 },
]

const WHO_WFL_GIRLS = [
  { x:45, SD3neg:1.9, SD2neg:2.1, SD0:2.5, SD2:3.0, SD3:3.3 },
  { x:45.5, SD3neg:2.0, SD2neg:2.1, SD0:2.5, SD2:3.1, SD3:3.4 },
  { x:46, SD3neg:2.0, SD2neg:2.2, SD0:2.6, SD2:3.2, SD3:3.5 },
  { x:46.5, SD3neg:2.1, SD2neg:2.3, SD0:2.7, SD2:3.3, SD3:3.6 },
  { x:47, SD3neg:2.2, SD2neg:2.4, SD0:2.8, SD2:3.4, SD3:3.7 },
  { x:47.5, SD3neg:2.2, SD2neg:2.4, SD0:2.9, SD2:3.5, SD3:3.8 },
  { x:48, SD3neg:2.3, SD2neg:2.5, SD0:3.0, SD2:3.6, SD3:4.0 },
  { x:48.5, SD3neg:2.4, SD2neg:2.6, SD0:3.1, SD2:3.7, SD3:4.1 },
  { x:49, SD3neg:2.4, SD2neg:2.6, SD0:3.2, SD2:3.8, SD3:4.2 },
  { x:49.5, SD3neg:2.5, SD2neg:2.7, SD0:3.3, SD2:3.9, SD3:4.3 },
  { x:50, SD3neg:2.6, SD2neg:2.8, SD0:3.4, SD2:4.0, SD3:4.5 },
  { x:50.5, SD3neg:2.7, SD2neg:2.9, SD0:3.5, SD2:4.2, SD3:4.6 },
  { x:51, SD3neg:2.8, SD2neg:3.0, SD0:3.6, SD2:4.3, SD3:4.8 },
  { x:51.5, SD3neg:2.8, SD2neg:3.1, SD0:3.7, SD2:4.4, SD3:4.9 },
  { x:52, SD3neg:2.9, SD2neg:3.2, SD0:3.8, SD2:4.6, SD3:5.1 },
  { x:52.5, SD3neg:3.0, SD2neg:3.3, SD0:3.9, SD2:4.7, SD3:5.2 },
  { x:53, SD3neg:3.1, SD2neg:3.4, SD0:4.0, SD2:4.9, SD3:5.4 },
  { x:53.5, SD3neg:3.2, SD2neg:3.5, SD0:4.2, SD2:5.0, SD3:5.5 },
  { x:54, SD3neg:3.3, SD2neg:3.6, SD0:4.3, SD2:5.2, SD3:5.7 },
  { x:54.5, SD3neg:3.4, SD2neg:3.7, SD0:4.4, SD2:5.3, SD3:5.9 },
  { x:55, SD3neg:3.5, SD2neg:3.8, SD0:4.5, SD2:5.5, SD3:6.1 },
  { x:55.5, SD3neg:3.6, SD2neg:3.9, SD0:4.7, SD2:5.7, SD3:6.3 },
  { x:56, SD3neg:3.7, SD2neg:4.0, SD0:4.8, SD2:5.8, SD3:6.4 },
  { x:56.5, SD3neg:3.8, SD2neg:4.1, SD0:5.0, SD2:6.0, SD3:6.6 },
  { x:57, SD3neg:3.9, SD2neg:4.3, SD0:5.1, SD2:6.1, SD3:6.8 },
  { x:57.5, SD3neg:4.0, SD2neg:4.4, SD0:5.2, SD2:6.3, SD3:7.0 },
  { x:58, SD3neg:4.1, SD2neg:4.5, SD0:5.4, SD2:6.5, SD3:7.1 },
  { x:58.5, SD3neg:4.2, SD2neg:4.6, SD0:5.5, SD2:6.6, SD3:7.3 },
  { x:59, SD3neg:4.3, SD2neg:4.7, SD0:5.6, SD2:6.8, SD3:7.5 },
  { x:59.5, SD3neg:4.4, SD2neg:4.8, SD0:5.7, SD2:6.9, SD3:7.7 },
  { x:60, SD3neg:4.5, SD2neg:4.9, SD0:5.9, SD2:7.1, SD3:7.8 },
  { x:60.5, SD3neg:4.6, SD2neg:5.0, SD0:6.0, SD2:7.3, SD3:8.0 },
  { x:61, SD3neg:4.7, SD2neg:5.1, SD0:6.1, SD2:7.4, SD3:8.2 },
  { x:61.5, SD3neg:4.8, SD2neg:5.2, SD0:6.3, SD2:7.6, SD3:8.4 },
  { x:62, SD3neg:4.9, SD2neg:5.3, SD0:6.4, SD2:7.7, SD3:8.5 },
  { x:62.5, SD3neg:5.0, SD2neg:5.4, SD0:6.5, SD2:7.8, SD3:8.7 },
  { x:63, SD3neg:5.1, SD2neg:5.5, SD0:6.6, SD2:8.0, SD3:8.8 },
  { x:63.5, SD3neg:5.2, SD2neg:5.6, SD0:6.7, SD2:8.1, SD3:9.0 },
  { x:64, SD3neg:5.3, SD2neg:5.7, SD0:6.9, SD2:8.3, SD3:9.1 },
  { x:64.5, SD3neg:5.4, SD2neg:5.8, SD0:7.0, SD2:8.4, SD3:9.3 },
  { x:65, SD3neg:5.5, SD2neg:5.9, SD0:7.1, SD2:8.6, SD3:9.5 },
  { x:65.5, SD3neg:5.5, SD2neg:6.0, SD0:7.2, SD2:8.7, SD3:9.6 },
  { x:66, SD3neg:5.6, SD2neg:6.1, SD0:7.3, SD2:8.8, SD3:9.8 },
  { x:66.5, SD3neg:5.7, SD2neg:6.2, SD0:7.4, SD2:9.0, SD3:9.9 },
  { x:67, SD3neg:5.8, SD2neg:6.3, SD0:7.5, SD2:9.1, SD3:10.0 },
  { x:67.5, SD3neg:5.9, SD2neg:6.4, SD0:7.6, SD2:9.2, SD3:10.2 },
  { x:68, SD3neg:6.0, SD2neg:6.5, SD0:7.7, SD2:9.4, SD3:10.3 },
  { x:68.5, SD3neg:6.1, SD2neg:6.6, SD0:7.9, SD2:9.5, SD3:10.5 },
  { x:69, SD3neg:6.1, SD2neg:6.7, SD0:8.0, SD2:9.6, SD3:10.6 },
  { x:69.5, SD3neg:6.2, SD2neg:6.8, SD0:8.1, SD2:9.7, SD3:10.7 },
  { x:70, SD3neg:6.3, SD2neg:6.9, SD0:8.2, SD2:9.9, SD3:10.9 },
  { x:70.5, SD3neg:6.4, SD2neg:6.9, SD0:8.3, SD2:10.0, SD3:11.0 },
  { x:71, SD3neg:6.5, SD2neg:7.0, SD0:8.4, SD2:10.1, SD3:11.1 },
  { x:71.5, SD3neg:6.5, SD2neg:7.1, SD0:8.5, SD2:10.2, SD3:11.3 },
  { x:72, SD3neg:6.6, SD2neg:7.2, SD0:8.6, SD2:10.3, SD3:11.4 },
  { x:72.5, SD3neg:6.7, SD2neg:7.3, SD0:8.7, SD2:10.5, SD3:11.5 },
  { x:73, SD3neg:6.8, SD2neg:7.4, SD0:8.8, SD2:10.6, SD3:11.7 },
  { x:73.5, SD3neg:6.9, SD2neg:7.4, SD0:8.9, SD2:10.7, SD3:11.8 },
  { x:74, SD3neg:6.9, SD2neg:7.5, SD0:9.0, SD2:10.8, SD3:11.9 },
  { x:74.5, SD3neg:7.0, SD2neg:7.6, SD0:9.1, SD2:10.9, SD3:12.0 },
  { x:75, SD3neg:7.1, SD2neg:7.7, SD0:9.1, SD2:11.0, SD3:12.2 },
  { x:75.5, SD3neg:7.1, SD2neg:7.8, SD0:9.2, SD2:11.1, SD3:12.3 },
  { x:76, SD3neg:7.2, SD2neg:7.8, SD0:9.3, SD2:11.2, SD3:12.4 },
  { x:76.5, SD3neg:7.3, SD2neg:7.9, SD0:9.4, SD2:11.4, SD3:12.5 },
  { x:77, SD3neg:7.4, SD2neg:8.0, SD0:9.5, SD2:11.5, SD3:12.6 },
  { x:77.5, SD3neg:7.4, SD2neg:8.1, SD0:9.6, SD2:11.6, SD3:12.8 },
  { x:78, SD3neg:7.5, SD2neg:8.2, SD0:9.7, SD2:11.7, SD3:12.9 },
  { x:78.5, SD3neg:7.6, SD2neg:8.2, SD0:9.8, SD2:11.8, SD3:13.0 },
  { x:79, SD3neg:7.7, SD2neg:8.3, SD0:9.9, SD2:11.9, SD3:13.1 },
  { x:79.5, SD3neg:7.7, SD2neg:8.4, SD0:10.0, SD2:12.0, SD3:13.3 },
  { x:80, SD3neg:7.8, SD2neg:8.5, SD0:10.1, SD2:12.1, SD3:13.4 },
  { x:80.5, SD3neg:7.9, SD2neg:8.6, SD0:10.2, SD2:12.3, SD3:13.5 },
  { x:81, SD3neg:8.0, SD2neg:8.7, SD0:10.3, SD2:12.4, SD3:13.7 },
  { x:81.5, SD3neg:8.1, SD2neg:8.8, SD0:10.4, SD2:12.5, SD3:13.8 },
  { x:82, SD3neg:8.1, SD2neg:8.8, SD0:10.5, SD2:12.6, SD3:13.9 },
  { x:82.5, SD3neg:8.2, SD2neg:8.9, SD0:10.6, SD2:12.8, SD3:14.1 },
  { x:83, SD3neg:8.3, SD2neg:9.0, SD0:10.7, SD2:12.9, SD3:14.2 },
  { x:83.5, SD3neg:8.4, SD2neg:9.1, SD0:10.9, SD2:13.1, SD3:14.4 },
  { x:84, SD3neg:8.5, SD2neg:9.2, SD0:11.0, SD2:13.2, SD3:14.5 },
  { x:84.5, SD3neg:8.6, SD2neg:9.3, SD0:11.1, SD2:13.3, SD3:14.7 },
  { x:85, SD3neg:8.7, SD2neg:9.4, SD0:11.2, SD2:13.5, SD3:14.9 },
  { x:85.5, SD3neg:8.8, SD2neg:9.5, SD0:11.3, SD2:13.6, SD3:15.0 },
  { x:86, SD3neg:8.9, SD2neg:9.7, SD0:11.5, SD2:13.8, SD3:15.2 },
  { x:86.5, SD3neg:9.0, SD2neg:9.8, SD0:11.6, SD2:13.9, SD3:15.4 },
  { x:87, SD3neg:9.1, SD2neg:9.9, SD0:11.7, SD2:14.1, SD3:15.5 },
  { x:87.5, SD3neg:9.2, SD2neg:10.0, SD0:11.8, SD2:14.2, SD3:15.7 },
  { x:88, SD3neg:9.3, SD2neg:10.1, SD0:12.0, SD2:14.4, SD3:15.9 },
  { x:88.5, SD3neg:9.4, SD2neg:10.2, SD0:12.1, SD2:14.5, SD3:16.0 },
  { x:89, SD3neg:9.5, SD2neg:10.3, SD0:12.2, SD2:14.7, SD3:16.2 },
  { x:89.5, SD3neg:9.6, SD2neg:10.4, SD0:12.3, SD2:14.8, SD3:16.4 },
  { x:90, SD3neg:9.7, SD2neg:10.5, SD0:12.5, SD2:15.0, SD3:16.5 },
  { x:90.5, SD3neg:9.8, SD2neg:10.6, SD0:12.6, SD2:15.1, SD3:16.7 },
  { x:91, SD3neg:9.9, SD2neg:10.7, SD0:12.7, SD2:15.3, SD3:16.9 },
  { x:91.5, SD3neg:10.0, SD2neg:10.8, SD0:12.8, SD2:15.5, SD3:17.0 },
  { x:92, SD3neg:10.1, SD2neg:10.9, SD0:13.0, SD2:15.6, SD3:17.2 },
  { x:92.5, SD3neg:10.1, SD2neg:11.0, SD0:13.1, SD2:15.8, SD3:17.4 },
  { x:93, SD3neg:10.2, SD2neg:11.1, SD0:13.2, SD2:15.9, SD3:17.5 },
  { x:93.5, SD3neg:10.3, SD2neg:11.2, SD0:13.3, SD2:16.1, SD3:17.7 },
  { x:94, SD3neg:10.4, SD2neg:11.3, SD0:13.5, SD2:16.2, SD3:17.9 },
  { x:94.5, SD3neg:10.5, SD2neg:11.4, SD0:13.6, SD2:16.4, SD3:18.0 },
  { x:95, SD3neg:10.6, SD2neg:11.5, SD0:13.7, SD2:16.5, SD3:18.2 },
  { x:95.5, SD3neg:10.7, SD2neg:11.6, SD0:13.8, SD2:16.7, SD3:18.4 },
  { x:96, SD3neg:10.8, SD2neg:11.7, SD0:14.0, SD2:16.8, SD3:18.6 },
  { x:96.5, SD3neg:10.9, SD2neg:11.8, SD0:14.1, SD2:17.0, SD3:18.7 },
  { x:97, SD3neg:11.0, SD2neg:12.0, SD0:14.2, SD2:17.1, SD3:18.9 },
  { x:97.5, SD3neg:11.1, SD2neg:12.1, SD0:14.4, SD2:17.3, SD3:19.1 },
  { x:98, SD3neg:11.2, SD2neg:12.2, SD0:14.5, SD2:17.5, SD3:19.3 },
  { x:98.5, SD3neg:11.3, SD2neg:12.3, SD0:14.6, SD2:17.6, SD3:19.5 },
  { x:99, SD3neg:11.4, SD2neg:12.4, SD0:14.8, SD2:17.8, SD3:19.6 },
  { x:99.5, SD3neg:11.5, SD2neg:12.5, SD0:14.9, SD2:18.0, SD3:19.8 },
  { x:100, SD3neg:11.6, SD2neg:12.6, SD0:15.0, SD2:18.1, SD3:20.0 },
  { x:100.5, SD3neg:11.7, SD2neg:12.7, SD0:15.2, SD2:18.3, SD3:20.2 },
  { x:101, SD3neg:11.8, SD2neg:12.8, SD0:15.3, SD2:18.5, SD3:20.4 },
  { x:101.5, SD3neg:11.9, SD2neg:13.0, SD0:15.5, SD2:18.7, SD3:20.6 },
  { x:102, SD3neg:12.0, SD2neg:13.1, SD0:15.6, SD2:18.9, SD3:20.8 },
  { x:102.5, SD3neg:12.1, SD2neg:13.2, SD0:15.8, SD2:19.0, SD3:21.0 },
  { x:103, SD3neg:12.3, SD2neg:13.3, SD0:15.9, SD2:19.2, SD3:21.3 },
  { x:103.5, SD3neg:12.4, SD2neg:13.5, SD0:16.1, SD2:19.4, SD3:21.5 },
  { x:104, SD3neg:12.5, SD2neg:13.6, SD0:16.2, SD2:19.6, SD3:21.7 },
  { x:104.5, SD3neg:12.6, SD2neg:13.7, SD0:16.4, SD2:19.8, SD3:21.9 },
  { x:105, SD3neg:12.7, SD2neg:13.8, SD0:16.5, SD2:20.0, SD3:22.2 },
  { x:105.5, SD3neg:12.8, SD2neg:14.0, SD0:16.7, SD2:20.2, SD3:22.4 },
  { x:106, SD3neg:13.0, SD2neg:14.1, SD0:16.9, SD2:20.5, SD3:22.6 },
  { x:106.5, SD3neg:13.1, SD2neg:14.3, SD0:17.1, SD2:20.7, SD3:22.9 },
  { x:107, SD3neg:13.2, SD2neg:14.4, SD0:17.2, SD2:20.9, SD3:23.1 },
  { x:107.5, SD3neg:13.3, SD2neg:14.5, SD0:17.4, SD2:21.1, SD3:23.4 },
  { x:108, SD3neg:13.5, SD2neg:14.7, SD0:17.6, SD2:21.3, SD3:23.6 },
  { x:108.5, SD3neg:13.6, SD2neg:14.8, SD0:17.8, SD2:21.6, SD3:23.9 },
  { x:109, SD3neg:13.7, SD2neg:15.0, SD0:18.0, SD2:21.8, SD3:24.2 },
  { x:109.5, SD3neg:13.9, SD2neg:15.1, SD0:18.1, SD2:22.0, SD3:24.4 },
  { x:110, SD3neg:14.0, SD2neg:15.3, SD0:18.3, SD2:22.3, SD3:24.7 },
]

const WHO_WFH_BOYS = [
  { x:65, SD3neg:5.9, SD2neg:6.3, SD0:7.4, SD2:8.8, SD3:9.6 },
  { x:65.5, SD3neg:6.0, SD2neg:6.4, SD0:7.6, SD2:8.9, SD3:9.8 },
  { x:66, SD3neg:6.1, SD2neg:6.5, SD0:7.7, SD2:9.1, SD3:9.9 },
  { x:66.5, SD3neg:6.1, SD2neg:6.6, SD0:7.8, SD2:9.2, SD3:10.1 },
  { x:67, SD3neg:6.2, SD2neg:6.7, SD0:7.9, SD2:9.4, SD3:10.2 },
  { x:67.5, SD3neg:6.3, SD2neg:6.8, SD0:8.0, SD2:9.5, SD3:10.4 },
  { x:68, SD3neg:6.4, SD2neg:6.9, SD0:8.1, SD2:9.6, SD3:10.5 },
  { x:68.5, SD3neg:6.5, SD2neg:7.0, SD0:8.2, SD2:9.8, SD3:10.7 },
  { x:69, SD3neg:6.6, SD2neg:7.1, SD0:8.4, SD2:9.9, SD3:10.8 },
  { x:69.5, SD3neg:6.7, SD2neg:7.2, SD0:8.5, SD2:10.0, SD3:11.0 },
  { x:70, SD3neg:6.8, SD2neg:7.3, SD0:8.6, SD2:10.2, SD3:11.1 },
  { x:70.5, SD3neg:6.9, SD2neg:7.4, SD0:8.7, SD2:10.3, SD3:11.3 },
  { x:71, SD3neg:6.9, SD2neg:7.5, SD0:8.8, SD2:10.4, SD3:11.4 },
  { x:71.5, SD3neg:7.0, SD2neg:7.6, SD0:8.9, SD2:10.6, SD3:11.6 },
  { x:72, SD3neg:7.1, SD2neg:7.7, SD0:9.0, SD2:10.7, SD3:11.7 },
  { x:72.5, SD3neg:7.2, SD2neg:7.8, SD0:9.1, SD2:10.8, SD3:11.8 },
  { x:73, SD3neg:7.3, SD2neg:7.9, SD0:9.2, SD2:11.0, SD3:12.0 },
  { x:73.5, SD3neg:7.4, SD2neg:7.9, SD0:9.3, SD2:11.1, SD3:12.1 },
  { x:74, SD3neg:7.4, SD2neg:8.0, SD0:9.4, SD2:11.2, SD3:12.2 },
  { x:74.5, SD3neg:7.5, SD2neg:8.1, SD0:9.5, SD2:11.3, SD3:12.4 },
  { x:75, SD3neg:7.6, SD2neg:8.2, SD0:9.6, SD2:11.4, SD3:12.5 },
  { x:75.5, SD3neg:7.7, SD2neg:8.3, SD0:9.7, SD2:11.6, SD3:12.6 },
  { x:76, SD3neg:7.7, SD2neg:8.4, SD0:9.8, SD2:11.7, SD3:12.8 },
  { x:76.5, SD3neg:7.8, SD2neg:8.5, SD0:9.9, SD2:11.8, SD3:12.9 },
  { x:77, SD3neg:7.9, SD2neg:8.5, SD0:10.0, SD2:11.9, SD3:13.0 },
  { x:77.5, SD3neg:8.0, SD2neg:8.6, SD0:10.1, SD2:12.0, SD3:13.1 },
  { x:78, SD3neg:8.0, SD2neg:8.7, SD0:10.2, SD2:12.1, SD3:13.3 },
  { x:78.5, SD3neg:8.1, SD2neg:8.8, SD0:10.3, SD2:12.2, SD3:13.4 },
  { x:79, SD3neg:8.2, SD2neg:8.8, SD0:10.4, SD2:12.3, SD3:13.5 },
  { x:79.5, SD3neg:8.3, SD2neg:8.9, SD0:10.5, SD2:12.4, SD3:13.6 },
  { x:80, SD3neg:8.3, SD2neg:9.0, SD0:10.6, SD2:12.6, SD3:13.7 },
  { x:80.5, SD3neg:8.4, SD2neg:9.1, SD0:10.7, SD2:12.7, SD3:13.8 },
  { x:81, SD3neg:8.5, SD2neg:9.2, SD0:10.8, SD2:12.8, SD3:14.0 },
  { x:81.5, SD3neg:8.6, SD2neg:9.3, SD0:10.9, SD2:12.9, SD3:14.1 },
  { x:82, SD3neg:8.7, SD2neg:9.3, SD0:11.0, SD2:13.0, SD3:14.2 },
  { x:82.5, SD3neg:8.7, SD2neg:9.4, SD0:11.1, SD2:13.1, SD3:14.4 },
  { x:83, SD3neg:8.8, SD2neg:9.5, SD0:11.2, SD2:13.3, SD3:14.5 },
  { x:83.5, SD3neg:8.9, SD2neg:9.6, SD0:11.3, SD2:13.4, SD3:14.6 },
  { x:84, SD3neg:9.0, SD2neg:9.7, SD0:11.4, SD2:13.5, SD3:14.8 },
  { x:84.5, SD3neg:9.1, SD2neg:9.9, SD0:11.5, SD2:13.7, SD3:14.9 },
  { x:85, SD3neg:9.2, SD2neg:10.0, SD0:11.7, SD2:13.8, SD3:15.1 },
  { x:85.5, SD3neg:9.3, SD2neg:10.1, SD0:11.8, SD2:13.9, SD3:15.2 },
  { x:86, SD3neg:9.4, SD2neg:10.2, SD0:11.9, SD2:14.1, SD3:15.4 },
  { x:86.5, SD3neg:9.5, SD2neg:10.3, SD0:12.0, SD2:14.2, SD3:15.5 },
  { x:87, SD3neg:9.6, SD2neg:10.4, SD0:12.2, SD2:14.4, SD3:15.7 },
  { x:87.5, SD3neg:9.7, SD2neg:10.5, SD0:12.3, SD2:14.5, SD3:15.8 },
  { x:88, SD3neg:9.8, SD2neg:10.6, SD0:12.4, SD2:14.7, SD3:16.0 },
  { x:88.5, SD3neg:9.9, SD2neg:10.7, SD0:12.5, SD2:14.8, SD3:16.1 },
  { x:89, SD3neg:10.0, SD2neg:10.8, SD0:12.6, SD2:14.9, SD3:16.3 },
  { x:89.5, SD3neg:10.1, SD2neg:10.9, SD0:12.8, SD2:15.1, SD3:16.4 },
  { x:90, SD3neg:10.2, SD2neg:11.0, SD0:12.9, SD2:15.2, SD3:16.6 },
  { x:90.5, SD3neg:10.3, SD2neg:11.1, SD0:13.0, SD2:15.3, SD3:16.7 },
  { x:91, SD3neg:10.4, SD2neg:11.2, SD0:13.1, SD2:15.5, SD3:16.9 },
  { x:91.5, SD3neg:10.5, SD2neg:11.3, SD0:13.2, SD2:15.6, SD3:17.0 },
  { x:92, SD3neg:10.6, SD2neg:11.4, SD0:13.4, SD2:15.8, SD3:17.2 },
  { x:92.5, SD3neg:10.7, SD2neg:11.5, SD0:13.5, SD2:15.9, SD3:17.3 },
  { x:93, SD3neg:10.8, SD2neg:11.6, SD0:13.6, SD2:16.0, SD3:17.5 },
  { x:93.5, SD3neg:10.9, SD2neg:11.7, SD0:13.7, SD2:16.2, SD3:17.6 },
  { x:94, SD3neg:11.0, SD2neg:11.8, SD0:13.8, SD2:16.3, SD3:17.8 },
  { x:94.5, SD3neg:11.1, SD2neg:11.9, SD0:13.9, SD2:16.5, SD3:17.9 },
  { x:95, SD3neg:11.1, SD2neg:12.0, SD0:14.1, SD2:16.6, SD3:18.1 },
  { x:95.5, SD3neg:11.2, SD2neg:12.1, SD0:14.2, SD2:16.7, SD3:18.3 },
  { x:96, SD3neg:11.3, SD2neg:12.2, SD0:14.3, SD2:16.9, SD3:18.4 },
  { x:96.5, SD3neg:11.4, SD2neg:12.3, SD0:14.4, SD2:17.0, SD3:18.6 },
  { x:97, SD3neg:11.5, SD2neg:12.4, SD0:14.6, SD2:17.2, SD3:18.8 },
  { x:97.5, SD3neg:11.6, SD2neg:12.5, SD0:14.7, SD2:17.4, SD3:18.9 },
  { x:98, SD3neg:11.7, SD2neg:12.6, SD0:14.8, SD2:17.5, SD3:19.1 },
  { x:98.5, SD3neg:11.8, SD2neg:12.8, SD0:14.9, SD2:17.7, SD3:19.3 },
  { x:99, SD3neg:11.9, SD2neg:12.9, SD0:15.1, SD2:17.9, SD3:19.5 },
  { x:99.5, SD3neg:12.0, SD2neg:13.0, SD0:15.2, SD2:18.0, SD3:19.7 },
  { x:100, SD3neg:12.1, SD2neg:13.1, SD0:15.4, SD2:18.2, SD3:19.9 },
  { x:100.5, SD3neg:12.2, SD2neg:13.2, SD0:15.5, SD2:18.4, SD3:20.1 },
  { x:101, SD3neg:12.3, SD2neg:13.3, SD0:15.6, SD2:18.5, SD3:20.3 },
  { x:101.5, SD3neg:12.4, SD2neg:13.4, SD0:15.8, SD2:18.7, SD3:20.5 },
  { x:102, SD3neg:12.5, SD2neg:13.6, SD0:15.9, SD2:18.9, SD3:20.7 },
  { x:102.5, SD3neg:12.6, SD2neg:13.7, SD0:16.1, SD2:19.1, SD3:20.9 },
  { x:103, SD3neg:12.8, SD2neg:13.8, SD0:16.2, SD2:19.3, SD3:21.1 },
  { x:103.5, SD3neg:12.9, SD2neg:13.9, SD0:16.4, SD2:19.5, SD3:21.3 },
  { x:104, SD3neg:13.0, SD2neg:14.0, SD0:16.5, SD2:19.7, SD3:21.6 },
  { x:104.5, SD3neg:13.1, SD2neg:14.2, SD0:16.7, SD2:19.9, SD3:21.8 },
  { x:105, SD3neg:13.2, SD2neg:14.3, SD0:16.8, SD2:20.1, SD3:22.0 },
  { x:105.5, SD3neg:13.3, SD2neg:14.4, SD0:17.0, SD2:20.3, SD3:22.2 },
  { x:106, SD3neg:13.4, SD2neg:14.5, SD0:17.2, SD2:20.5, SD3:22.5 },
  { x:106.5, SD3neg:13.5, SD2neg:14.7, SD0:17.3, SD2:20.7, SD3:22.7 },
  { x:107, SD3neg:13.7, SD2neg:14.8, SD0:17.5, SD2:20.9, SD3:22.9 },
  { x:107.5, SD3neg:13.8, SD2neg:14.9, SD0:17.7, SD2:21.1, SD3:23.2 },
  { x:108, SD3neg:13.9, SD2neg:15.1, SD0:17.8, SD2:21.3, SD3:23.4 },
  { x:108.5, SD3neg:14.0, SD2neg:15.2, SD0:18.0, SD2:21.5, SD3:23.7 },
  { x:109, SD3neg:14.1, SD2neg:15.3, SD0:18.2, SD2:21.8, SD3:23.9 },
  { x:109.5, SD3neg:14.3, SD2neg:15.5, SD0:18.3, SD2:22.0, SD3:24.2 },
  { x:110, SD3neg:14.4, SD2neg:15.6, SD0:18.5, SD2:22.2, SD3:24.4 },
  { x:110.5, SD3neg:14.5, SD2neg:15.8, SD0:18.7, SD2:22.4, SD3:24.7 },
  { x:111, SD3neg:14.6, SD2neg:15.9, SD0:18.9, SD2:22.7, SD3:25.0 },
  { x:111.5, SD3neg:14.8, SD2neg:16.0, SD0:19.1, SD2:22.9, SD3:25.2 },
  { x:112, SD3neg:14.9, SD2neg:16.2, SD0:19.2, SD2:23.1, SD3:25.5 },
  { x:112.5, SD3neg:15.0, SD2neg:16.3, SD0:19.4, SD2:23.4, SD3:25.8 },
  { x:113, SD3neg:15.2, SD2neg:16.5, SD0:19.6, SD2:23.6, SD3:26.0 },
  { x:113.5, SD3neg:15.3, SD2neg:16.6, SD0:19.8, SD2:23.9, SD3:26.3 },
  { x:114, SD3neg:15.4, SD2neg:16.8, SD0:20.0, SD2:24.1, SD3:26.6 },
  { x:114.5, SD3neg:15.6, SD2neg:16.9, SD0:20.2, SD2:24.4, SD3:26.9 },
  { x:115, SD3neg:15.7, SD2neg:17.1, SD0:20.4, SD2:24.6, SD3:27.2 },
  { x:115.5, SD3neg:15.8, SD2neg:17.2, SD0:20.6, SD2:24.9, SD3:27.5 },
  { x:116, SD3neg:16.0, SD2neg:17.4, SD0:20.8, SD2:25.1, SD3:27.8 },
  { x:116.5, SD3neg:16.1, SD2neg:17.5, SD0:21.0, SD2:25.4, SD3:28.0 },
  { x:117, SD3neg:16.2, SD2neg:17.7, SD0:21.2, SD2:25.6, SD3:28.3 },
  { x:117.5, SD3neg:16.4, SD2neg:17.9, SD0:21.4, SD2:25.9, SD3:28.6 },
  { x:118, SD3neg:16.5, SD2neg:18.0, SD0:21.6, SD2:26.1, SD3:28.9 },
  { x:118.5, SD3neg:16.7, SD2neg:18.2, SD0:21.8, SD2:26.4, SD3:29.2 },
  { x:119, SD3neg:16.8, SD2neg:18.3, SD0:22.0, SD2:26.6, SD3:29.5 },
  { x:119.5, SD3neg:16.9, SD2neg:18.5, SD0:22.2, SD2:26.9, SD3:29.8 },
  { x:120, SD3neg:17.1, SD2neg:18.6, SD0:22.4, SD2:27.2, SD3:30.1 },
]

const WHO_WFH_GIRLS = [
  { x:65, SD3neg:5.6, SD2neg:6.1, SD0:7.2, SD2:8.7, SD3:9.7 },
  { x:65.5, SD3neg:5.7, SD2neg:6.2, SD0:7.4, SD2:8.9, SD3:9.8 },
  { x:66, SD3neg:5.8, SD2neg:6.3, SD0:7.5, SD2:9.0, SD3:10.0 },
  { x:66.5, SD3neg:5.8, SD2neg:6.4, SD0:7.6, SD2:9.1, SD3:10.1 },
  { x:67, SD3neg:5.9, SD2neg:6.4, SD0:7.7, SD2:9.3, SD3:10.2 },
  { x:67.5, SD3neg:6.0, SD2neg:6.5, SD0:7.8, SD2:9.4, SD3:10.4 },
  { x:68, SD3neg:6.1, SD2neg:6.6, SD0:7.9, SD2:9.5, SD3:10.5 },
  { x:68.5, SD3neg:6.2, SD2neg:6.7, SD0:8.0, SD2:9.7, SD3:10.7 },
  { x:69, SD3neg:6.3, SD2neg:6.8, SD0:8.1, SD2:9.8, SD3:10.8 },
  { x:69.5, SD3neg:6.3, SD2neg:6.9, SD0:8.2, SD2:9.9, SD3:10.9 },
  { x:70, SD3neg:6.4, SD2neg:7.0, SD0:8.3, SD2:10.0, SD3:11.1 },
  { x:70.5, SD3neg:6.5, SD2neg:7.1, SD0:8.4, SD2:10.1, SD3:11.2 },
  { x:71, SD3neg:6.6, SD2neg:7.1, SD0:8.5, SD2:10.3, SD3:11.3 },
  { x:71.5, SD3neg:6.7, SD2neg:7.2, SD0:8.6, SD2:10.4, SD3:11.5 },
  { x:72, SD3neg:6.7, SD2neg:7.3, SD0:8.7, SD2:10.5, SD3:11.6 },
  { x:72.5, SD3neg:6.8, SD2neg:7.4, SD0:8.8, SD2:10.6, SD3:11.7 },
  { x:73, SD3neg:6.9, SD2neg:7.5, SD0:8.9, SD2:10.7, SD3:11.8 },
  { x:73.5, SD3neg:7.0, SD2neg:7.6, SD0:9.0, SD2:10.8, SD3:12.0 },
  { x:74, SD3neg:7.0, SD2neg:7.6, SD0:9.1, SD2:11.0, SD3:12.1 },
  { x:74.5, SD3neg:7.1, SD2neg:7.7, SD0:9.2, SD2:11.1, SD3:12.2 },
  { x:75, SD3neg:7.2, SD2neg:7.8, SD0:9.3, SD2:11.2, SD3:12.3 },
  { x:75.5, SD3neg:7.2, SD2neg:7.9, SD0:9.4, SD2:11.3, SD3:12.5 },
  { x:76, SD3neg:7.3, SD2neg:8.0, SD0:9.5, SD2:11.4, SD3:12.6 },
  { x:76.5, SD3neg:7.4, SD2neg:8.0, SD0:9.6, SD2:11.5, SD3:12.7 },
  { x:77, SD3neg:7.5, SD2neg:8.1, SD0:9.6, SD2:11.6, SD3:12.8 },
  { x:77.5, SD3neg:7.5, SD2neg:8.2, SD0:9.7, SD2:11.7, SD3:12.9 },
  { x:78, SD3neg:7.6, SD2neg:8.3, SD0:9.8, SD2:11.8, SD3:13.1 },
  { x:78.5, SD3neg:7.7, SD2neg:8.4, SD0:9.9, SD2:12.0, SD3:13.2 },
  { x:79, SD3neg:7.8, SD2neg:8.4, SD0:10.0, SD2:12.1, SD3:13.3 },
  { x:79.5, SD3neg:7.8, SD2neg:8.5, SD0:10.1, SD2:12.2, SD3:13.4 },
  { x:80, SD3neg:7.9, SD2neg:8.6, SD0:10.2, SD2:12.3, SD3:13.6 },
  { x:80.5, SD3neg:8.0, SD2neg:8.7, SD0:10.3, SD2:12.4, SD3:13.7 },
  { x:81, SD3neg:8.1, SD2neg:8.8, SD0:10.4, SD2:12.6, SD3:13.9 },
  { x:81.5, SD3neg:8.2, SD2neg:8.9, SD0:10.6, SD2:12.7, SD3:14.0 },
  { x:82, SD3neg:8.3, SD2neg:9.0, SD0:10.7, SD2:12.8, SD3:14.1 },
  { x:82.5, SD3neg:8.4, SD2neg:9.1, SD0:10.8, SD2:13.0, SD3:14.3 },
  { x:83, SD3neg:8.5, SD2neg:9.2, SD0:10.9, SD2:13.1, SD3:14.5 },
  { x:83.5, SD3neg:8.5, SD2neg:9.3, SD0:11.0, SD2:13.3, SD3:14.6 },
  { x:84, SD3neg:8.6, SD2neg:9.4, SD0:11.1, SD2:13.4, SD3:14.8 },
  { x:84.5, SD3neg:8.7, SD2neg:9.5, SD0:11.3, SD2:13.5, SD3:14.9 },
  { x:85, SD3neg:8.8, SD2neg:9.6, SD0:11.4, SD2:13.7, SD3:15.1 },
  { x:85.5, SD3neg:8.9, SD2neg:9.7, SD0:11.5, SD2:13.8, SD3:15.3 },
  { x:86, SD3neg:9.0, SD2neg:9.8, SD0:11.6, SD2:14.0, SD3:15.4 },
  { x:86.5, SD3neg:9.1, SD2neg:9.9, SD0:11.8, SD2:14.2, SD3:15.6 },
  { x:87, SD3neg:9.2, SD2neg:10.0, SD0:11.9, SD2:14.3, SD3:15.8 },
  { x:87.5, SD3neg:9.3, SD2neg:10.1, SD0:12.0, SD2:14.5, SD3:15.9 },
  { x:88, SD3neg:9.4, SD2neg:10.2, SD0:12.1, SD2:14.6, SD3:16.1 },
  { x:88.5, SD3neg:9.5, SD2neg:10.3, SD0:12.3, SD2:14.8, SD3:16.3 },
  { x:89, SD3neg:9.6, SD2neg:10.4, SD0:12.4, SD2:14.9, SD3:16.4 },
  { x:89.5, SD3neg:9.7, SD2neg:10.5, SD0:12.5, SD2:15.1, SD3:16.6 },
  { x:90, SD3neg:9.8, SD2neg:10.6, SD0:12.6, SD2:15.2, SD3:16.8 },
  { x:90.5, SD3neg:9.9, SD2neg:10.7, SD0:12.8, SD2:15.4, SD3:16.9 },
  { x:91, SD3neg:10.0, SD2neg:10.9, SD0:12.9, SD2:15.5, SD3:17.1 },
  { x:91.5, SD3neg:10.1, SD2neg:11.0, SD0:13.0, SD2:15.7, SD3:17.3 },
  { x:92, SD3neg:10.2, SD2neg:11.1, SD0:13.1, SD2:15.8, SD3:17.4 },
  { x:92.5, SD3neg:10.3, SD2neg:11.2, SD0:13.3, SD2:16.0, SD3:17.6 },
  { x:93, SD3neg:10.4, SD2neg:11.3, SD0:13.4, SD2:16.1, SD3:17.8 },
  { x:93.5, SD3neg:10.5, SD2neg:11.4, SD0:13.5, SD2:16.3, SD3:17.9 },
  { x:94, SD3neg:10.6, SD2neg:11.5, SD0:13.6, SD2:16.4, SD3:18.1 },
  { x:94.5, SD3neg:10.7, SD2neg:11.6, SD0:13.8, SD2:16.6, SD3:18.3 },
  { x:95, SD3neg:10.8, SD2neg:11.7, SD0:13.9, SD2:16.7, SD3:18.5 },
  { x:95.5, SD3neg:10.8, SD2neg:11.8, SD0:14.0, SD2:16.9, SD3:18.6 },
  { x:96, SD3neg:10.9, SD2neg:11.9, SD0:14.1, SD2:17.0, SD3:18.8 },
  { x:96.5, SD3neg:11.0, SD2neg:12.0, SD0:14.3, SD2:17.2, SD3:19.0 },
  { x:97, SD3neg:11.1, SD2neg:12.1, SD0:14.4, SD2:17.4, SD3:19.2 },
  { x:97.5, SD3neg:11.2, SD2neg:12.2, SD0:14.5, SD2:17.5, SD3:19.3 },
  { x:98, SD3neg:11.3, SD2neg:12.3, SD0:14.7, SD2:17.7, SD3:19.5 },
  { x:98.5, SD3neg:11.4, SD2neg:12.4, SD0:14.8, SD2:17.9, SD3:19.7 },
  { x:99, SD3neg:11.5, SD2neg:12.5, SD0:14.9, SD2:18.0, SD3:19.9 },
  { x:99.5, SD3neg:11.6, SD2neg:12.7, SD0:15.1, SD2:18.2, SD3:20.1 },
  { x:100, SD3neg:11.7, SD2neg:12.8, SD0:15.2, SD2:18.4, SD3:20.3 },
  { x:100.5, SD3neg:11.9, SD2neg:12.9, SD0:15.4, SD2:18.6, SD3:20.5 },
  { x:101, SD3neg:12.0, SD2neg:13.0, SD0:15.5, SD2:18.7, SD3:20.7 },
  { x:101.5, SD3neg:12.1, SD2neg:13.1, SD0:15.7, SD2:18.9, SD3:20.9 },
  { x:102, SD3neg:12.2, SD2neg:13.3, SD0:15.8, SD2:19.1, SD3:21.1 },
  { x:102.5, SD3neg:12.3, SD2neg:13.4, SD0:16.0, SD2:19.3, SD3:21.4 },
  { x:103, SD3neg:12.4, SD2neg:13.5, SD0:16.1, SD2:19.5, SD3:21.6 },
  { x:103.5, SD3neg:12.5, SD2neg:13.6, SD0:16.3, SD2:19.7, SD3:21.8 },
  { x:104, SD3neg:12.6, SD2neg:13.8, SD0:16.4, SD2:19.9, SD3:22.0 },
  { x:104.5, SD3neg:12.8, SD2neg:13.9, SD0:16.6, SD2:20.1, SD3:22.3 },
  { x:105, SD3neg:12.9, SD2neg:14.0, SD0:16.8, SD2:20.3, SD3:22.5 },
  { x:105.5, SD3neg:13.0, SD2neg:14.2, SD0:16.9, SD2:20.5, SD3:22.7 },
  { x:106, SD3neg:13.1, SD2neg:14.3, SD0:17.1, SD2:20.8, SD3:23.0 },
  { x:106.5, SD3neg:13.3, SD2neg:14.5, SD0:17.3, SD2:21.0, SD3:23.2 },
  { x:107, SD3neg:13.4, SD2neg:14.6, SD0:17.5, SD2:21.2, SD3:23.5 },
  { x:107.5, SD3neg:13.5, SD2neg:14.7, SD0:17.7, SD2:21.4, SD3:23.7 },
  { x:108, SD3neg:13.7, SD2neg:14.9, SD0:17.8, SD2:21.7, SD3:24.0 },
  { x:108.5, SD3neg:13.8, SD2neg:15.0, SD0:18.0, SD2:21.9, SD3:24.3 },
  { x:109, SD3neg:13.9, SD2neg:15.2, SD0:18.2, SD2:22.1, SD3:24.5 },
  { x:109.5, SD3neg:14.1, SD2neg:15.4, SD0:18.4, SD2:22.4, SD3:24.8 },
  { x:110, SD3neg:14.2, SD2neg:15.5, SD0:18.6, SD2:22.6, SD3:25.1 },
  { x:110.5, SD3neg:14.4, SD2neg:15.7, SD0:18.8, SD2:22.9, SD3:25.4 },
  { x:111, SD3neg:14.5, SD2neg:15.8, SD0:19.0, SD2:23.1, SD3:25.7 },
  { x:111.5, SD3neg:14.7, SD2neg:16.0, SD0:19.2, SD2:23.4, SD3:26.0 },
  { x:112, SD3neg:14.8, SD2neg:16.2, SD0:19.4, SD2:23.6, SD3:26.2 },
  { x:112.5, SD3neg:15.0, SD2neg:16.3, SD0:19.6, SD2:23.9, SD3:26.5 },
  { x:113, SD3neg:15.1, SD2neg:16.5, SD0:19.8, SD2:24.2, SD3:26.8 },
  { x:113.5, SD3neg:15.3, SD2neg:16.7, SD0:20.0, SD2:24.4, SD3:27.1 },
  { x:114, SD3neg:15.4, SD2neg:16.8, SD0:20.2, SD2:24.7, SD3:27.4 },
  { x:114.5, SD3neg:15.6, SD2neg:17.0, SD0:20.5, SD2:25.0, SD3:27.8 },
  { x:115, SD3neg:15.7, SD2neg:17.2, SD0:20.7, SD2:25.2, SD3:28.1 },
  { x:115.5, SD3neg:15.9, SD2neg:17.3, SD0:20.9, SD2:25.5, SD3:28.4 },
  { x:116, SD3neg:16.0, SD2neg:17.5, SD0:21.1, SD2:25.8, SD3:28.7 },
  { x:116.5, SD3neg:16.2, SD2neg:17.7, SD0:21.3, SD2:26.1, SD3:29.0 },
  { x:117, SD3neg:16.3, SD2neg:17.8, SD0:21.5, SD2:26.3, SD3:29.3 },
  { x:117.5, SD3neg:16.5, SD2neg:18.0, SD0:21.7, SD2:26.6, SD3:29.6 },
  { x:118, SD3neg:16.6, SD2neg:18.2, SD0:22.0, SD2:26.9, SD3:29.9 },
  { x:118.5, SD3neg:16.8, SD2neg:18.4, SD0:22.2, SD2:27.2, SD3:30.3 },
  { x:119, SD3neg:16.9, SD2neg:18.5, SD0:22.4, SD2:27.4, SD3:30.6 },
  { x:119.5, SD3neg:17.1, SD2neg:18.7, SD0:22.6, SD2:27.7, SD3:30.9 },
  { x:120, SD3neg:17.3, SD2neg:18.9, SD0:22.8, SD2:28.0, SD3:31.2 },
]



const WHO_CHARTS = {
  weightAge: {
    xField: 'age_months',
    yField: 'berat_badan',
    minX: 0,
    maxX: 60,
  },
  lengthAge: {
    xField: 'age_months',
    yField: 'tinggi_badan',
    minX: 0,
    maxX: 60,
  },
  weightLength: {
    xField: 'tinggi_badan',
    yField: 'berat_badan',
    minX: 45,
    maxX: 120,
  },
}

function normalizeReferenceData(data) {
  return data.map(row => ({
    x: row.m,
    SD3neg: row.SD3neg,
    SD2neg: row.SD2neg,
    SD0: row.SD0,
    SD2: row.SD2,
    SD3: row.SD3,
  }))
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function calcAgeMonthsAtDate(dob, targetDate = null) {
  if (!dob) return null

  const birth = new Date(dob)
  const target = targetDate ? new Date(targetDate) : new Date()

  if (Number.isNaN(birth.getTime()) || Number.isNaN(target.getTime())) return null

  let months = (target.getFullYear() - birth.getFullYear()) * 12
  months += target.getMonth() - birth.getMonth()

  if (target.getDate() < birth.getDate()) {
    months -= 1
  }

  return Math.max(0, months)
}

function getWHOPointSource(balita, type) {
  const point = balita?.whoPoints?.[type]

  if (!point) return balita

  return {
    ...balita,
    ...point,
    jenis_kelamin: balita?.jenis_kelamin,
    tanggal_lahir: balita?.tanggal_lahir,
  }
}

function getWeightLengthReferenceKind(balita) {
  const age = toNumberOrNull(balita?.age_months)

  return age !== null && age < 24 ? 'length' : 'height'
}

function getWHOReferenceData(type, balita) {
  const source = getWHOPointSource(balita, type)
  const isBoy = balita?.jenis_kelamin === 'Laki-laki'

  if (type === 'weightAge') {
    return normalizeReferenceData(isBoy ? WHO_BOYS : WHO_GIRLS)
  }

  if (type === 'lengthAge') {
    return isBoy ? WHO_LHFA_BOYS : WHO_LHFA_GIRLS
  }

  const kind = getWeightLengthReferenceKind(source)

  if (kind === 'length') {
    return isBoy ? WHO_WFL_BOYS : WHO_WFL_GIRLS
  }

  return isBoy ? WHO_WFH_BOYS : WHO_WFH_GIRLS
}

function getWHOPointX(balita, type) {
  const chart = WHO_CHARTS[type]
  if (!chart) return null

  const source = getWHOPointSource(balita, type)
  return toNumberOrNull(source?.[chart.xField])
}

function getWHOPointY(balita, type) {
  const chart = WHO_CHARTS[type]
  if (!chart) return null

  const source = getWHOPointSource(balita, type)
  return toNumberOrNull(source?.[chart.yField])
}

function findNearestReferenceRow(type, x, balita) {
  const data = getWHOReferenceData(type, balita)
  if (!Number.isFinite(x) || data.length === 0) return null

  const minX = data[0].x
  const maxX = data[data.length - 1].x
  if (x < minX || x > maxX) return null

  return data.reduce((nearest, row) =>
    Math.abs(row.x - x) < Math.abs(nearest.x - x) ? row : nearest
  , data[0])
}

function getWHOZScore(balita, type) {
  const x = getWHOPointX(balita, type)
  const y = getWHOPointY(balita, type)
  const row = findNearestReferenceRow(type, x, balita)

  if (!row || !Number.isFinite(y)) return null

  if (y >= row.SD0) {
    const range = row.SD2 - row.SD0
    return range > 0 ? ((y - row.SD0) / range) * 2 : 0
  }

  const range = row.SD0 - row.SD2neg
  return range > 0 ? ((y - row.SD0) / range) * 2 : 0
}

function getWHOStatusLabel(balita, type) {
  const z = getWHOZScore(balita, type)
  if (z === null) return '–'

  if (type === 'lengthAge') {
    if (z < -3) return 'Sangat Pendek'
    if (z < -2) return 'Pendek'
    if (z <= 3) return 'Normal'
    return 'Tinggi'
  }

  if (z < -3) return 'Gizi Buruk'
  if (z < -2) return 'Gizi Kurang'
  if (z <= 1) return 'Gizi Baik'
  if (z <= 2) return 'Berisiko Lebih'
  if (z <= 3) return 'Gizi Lebih'
  return 'Obesitas'
}

function getWHOStatusClass(balita, type) {
  const z = getWHOZScore(balita, type)
  if (z === null) return 'status-empty'

  if (type === 'lengthAge') {
    if (z < -3) return 'status-buruk'
    if (z < -2) return 'status-kurang'
    if (z <= 3) return 'status-baik'
    return 'status-lebih'
  }

  if (z < -3) return 'status-buruk'
  if (z < -2) return 'status-kurang'
  if (z <= 1) return 'status-baik'
  if (z <= 2) return 'status-risiko'
  return 'status-lebih'
}

function formatZScore(z) {
  return Number.isFinite(z) ? z.toFixed(2) : '–'
}

// ─────────────────────────────────────────────────────
// LIFECYCLE HOOKS
// ─────────────────────────────────────────────────────
onMounted(() => {
  if (isUnlocked.value) {
    fetchData()
  }
})

onBeforeUnmount(() => {
  // Cleanup saat component unmount
  // Jangan lock session, biarkan tetap aktif saat user pindah halaman
})
</script>


<style scoped>
/* ================================================================
   MONTH FILTER LAYOUT FIX
   Khusus KlasifikasiBalita.vue versi per bulan
   Desktop dibuat lengkap: < Bulan > Bulan Ini
   Mobile tetap turun rapi per baris
   ================================================================ */

.month-switcher {
  flex: 0 0 auto !important;
  width: max-content !important;
  max-width: none !important;
  display: grid !important;
  grid-template-columns: 42px 150px 42px 92px !important;
  align-items: center !important;
  gap: 8px !important;
  min-width: 0 !important;
}

.month-nav-btn,
.month-today-btn {
  min-height: 42px;
  height: 42px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--white);
  color: var(--sapphire);
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s, box-shadow 0.2s;
}

.month-nav-btn {
  width: 42px;
  min-width: 42px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.month-today-btn {
  width: 92px;
  min-width: 92px;
  padding: 0 12px;
  white-space: nowrap;
}

.month-nav-btn:hover,
.month-today-btn:hover {
  border-color: var(--scooter);
  background: #F8FDFC;
  color: var(--scooter);
}

.month-input {
  min-height: 42px;
  height: 42px;
  width: 150px;
  min-width: 150px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--white);
  color: var(--sapphire);
  padding: 0 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  outline: none;
}

.month-input:focus {
  border-color: var(--scooter);
  box-shadow: 0 0 0 3px rgba(47, 157, 148, 0.1);
}

/* Paksa toolbar tidak numpuk dengan judul */
:deep(.data-balita-wrap .balita-page),
.balita-page {
  align-items: stretch !important;
}

:deep(.data-balita-wrap .balita-toolbar),
.balita-toolbar {
  display: grid !important;
  grid-template-columns: minmax(220px, 1fr) auto !important;
  align-items: center !important;
  gap: 12px !important;
  width: 100% !important;
}

:deep(.data-balita-wrap .toolbar-left),
.toolbar-left {
  min-width: 0 !important;
  justify-content: flex-start !important;
}

:deep(.data-balita-wrap .toolbar-info),
.toolbar-info {
  align-items: flex-start !important;
  text-align: left !important;
  min-width: 0 !important;
}

:deep(.data-balita-wrap .toolbar-right),
.toolbar-right {
  min-width: 0 !important;
  display: flex !important;
  flex-wrap: nowrap !important;
  justify-content: flex-end !important;
  align-items: center !important;
  gap: 8px !important;
}

:deep(.data-balita-wrap .search-wrap),
.search-wrap {
  flex: 0 0 220px !important;
  width: 220px !important;
  min-width: 220px !important;
}

:deep(.data-balita-wrap .filter-select),
.filter-select {
  flex: 0 0 210px !important;
  width: 210px !important;
  min-width: 210px !important;
}

:deep(.data-balita-wrap .btn-lock),
.btn-lock {
  flex: 0 0 42px !important;
  width: 42px !important;
  min-width: 42px !important;
  height: 42px !important;
}

/* ================================================================
   DESKTOP SEMPIT DAN LAPTOP
   Jika ruang kanan tidak cukup, filter turun rapi, bukan kepotong
   ================================================================ */

@media (max-width: 1500px) {
  :deep(.data-balita-wrap .balita-toolbar),
  .balita-toolbar {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 10px !important;
  }

  :deep(.data-balita-wrap .toolbar-right),
  .toolbar-right {
    width: 100% !important;
    justify-content: flex-start !important;
    flex-wrap: wrap !important;
  }

  :deep(.data-balita-wrap .search-wrap),
  .search-wrap {
    flex: 1 1 260px !important;
    width: auto !important;
    min-width: 230px !important;
  }

  :deep(.data-balita-wrap .filter-select),
  .filter-select {
    flex: 0 0 230px !important;
    width: 230px !important;
    min-width: 210px !important;
  }
}

@media (max-width: 1023px) {
  .month-switcher {
    grid-template-columns: 42px 150px 42px 92px !important;
  }

  :deep(.data-balita-wrap .search-wrap),
  .search-wrap {
    flex: 1 1 220px !important;
    min-width: 220px !important;
  }

  :deep(.data-balita-wrap .filter-select),
  .filter-select {
    flex: 0 0 210px !important;
    width: 210px !important;
    min-width: 190px !important;
  }
}

/* ================================================================
   MOBILE
   Susunan:
   Baris 1: < bulan >
   Baris 2: Bulan Ini
   Baris 3: Search
   Baris 4: Filter + Lock
   ================================================================ */

@media (max-width: 639px) {
  :deep(.data-balita-wrap .balita-page),
  .balita-page {
    padding: 14px 12px !important;
    gap: 10px !important;
  }

  :deep(.data-balita-wrap .balita-toolbar),
  .balita-toolbar {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 10px !important;
  }

  :deep(.data-balita-wrap .toolbar-left),
  .toolbar-left {
    width: 100% !important;
  }

  :deep(.data-balita-wrap .toolbar-right),
  .toolbar-right {
    width: 100% !important;
    display: grid !important;
    grid-template-columns: 1fr 42px !important;
    gap: 8px !important;
    align-items: stretch !important;
  }

  .month-switcher {
    grid-column: 1 / -1 !important;
    width: 100% !important;
    max-width: 100% !important;
    display: grid !important;
    grid-template-columns: 42px minmax(0, 1fr) 42px !important;
    gap: 8px !important;
    order: 0 !important;
  }

  .month-nav-btn {
    width: 42px !important;
    min-width: 42px !important;
  }

  .month-input {
    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;
    font-size: 13px !important;
    text-align: center !important;
  }

  .month-today-btn {
    grid-column: 1 / -1 !important;
    width: 100% !important;
    min-width: 0 !important;
    min-height: 42px !important;
    padding: 0 12px !important;
  }

  :deep(.data-balita-wrap .search-wrap),
  .search-wrap {
    grid-column: 1 / -1 !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;
    order: initial !important;
    flex: none !important;
  }

  :deep(.data-balita-wrap .filter-select),
  .filter-select {
    grid-column: 1 / 2 !important;
    width: 100% !important;
    min-width: 0 !important;
    height: 42px !important;
    order: initial !important;
    flex: none !important;
  }

  :deep(.data-balita-wrap .btn-lock),
  .btn-lock {
    grid-column: 2 / 3 !important;
    width: 42px !important;
    min-width: 42px !important;
    height: 42px !important;
    order: initial !important;
  }

  :deep(.data-balita-wrap .table-wrap),
  .table-wrap {
    width: 100% !important;
    overflow-x: auto !important;
  }

  :deep(.data-balita-wrap .balita-table),
  .balita-table {
    min-width: 820px !important;
  }
}

@media (max-width: 449px) {
  .month-switcher {
    grid-template-columns: 40px minmax(0, 1fr) 40px !important;
    gap: 7px !important;
  }

  .month-nav-btn,
  .month-today-btn,
  .month-input {
    min-height: 40px !important;
    height: 40px !important;
  }

  .month-nav-btn {
    width: 40px !important;
    min-width: 40px !important;
  }

  :deep(.data-balita-wrap .btn-lock),
  .btn-lock {
    width: 42px !important;
    min-width: 42px !important;
  }

  :deep(.data-balita-wrap .balita-table),
  .balita-table {
    min-width: 780px !important;
  }
}
</style>
