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
              <span class="toolbar-count">{{ filteredBalita.length }} balita terdaftar</span>
            </div>
          </div>
          <div class="toolbar-right">
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
          <button @click="fetchBalita">Coba Lagi</button>
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
                <th class="col-tb">Tinggi Badan (cm)</th>
                <th class="col-bb">Berat Badan (kg)</th>
                <th class="col-bmi">Status BMI</th>
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
                <td class="col-tb">{{ b.tinggi_badan ?? '–' }}</td>
                <td class="col-bb">{{ b.berat_badan ?? '–' }}</td>
                <td class="col-bmi">
                  <span v-if="b.berat_badan && b.tinggi_badan" class="bmi-badge" :class="getBMIStatusClass(b)">
                    {{ getBMIStatus(b) }}
                    <small>({{ calculateBMI(b).toFixed(1) }})</small>
                  </span>
                  <span v-else class="bmi-badge">–</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </transition>

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
import { ref, computed, watch, nextTick } from 'vue'
import { createClient } from '@supabase/supabase-js'
import '../assets/DataBalita.css'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

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
// ─────────────────────────────────────────────────────
const unlockedMap = ref({})
const pwInput     = ref('')
const showPw      = ref(false)
const pwError     = ref('')
const pwLoading   = ref(false)
const pwInputRef  = ref(null)

const isUnlocked = computed(() => !!unlockedMap.value[props.activePosyanduId])

// Reset password input setiap ganti posyandu
watch(() => props.activePosyanduId, () => {
  pwInput.value = ''
  pwError.value = ''
  showPw.value  = false
  if (!isUnlocked.value) {
    nextTick(() => pwInputRef.value?.focus())
  } else {
    fetchBalita()
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

    const { data, error } = await supabase.rpc('verify_posyandu_password', {
      p_posyandu_key: posyanduKey,
      p_password:     pwInput.value,
    })

    if (error) {
      console.error('[submitPassword] RPC Error:', error)
      throw new Error(`Gagal verifikasi: ${error.message}`)
    }

    if (data === true) {
      unlockedMap.value[props.activePosyanduId] = true
      pwInput.value = ''
      fetchBalita()
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
    delete unlockedMap.value[props.activePosyanduId]
    unlockedMap.value = { ...unlockedMap.value }
    balitaList.value = []
  }
}

// ─────────────────────────────────────────────────────
// DATA STATE
// ─────────────────────────────────────────────────────
const balitaList   = ref([])
const tableLoading = ref(false)
const tableError   = ref(null)
const searchQuery  = ref('')
const filterGender = ref('')

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

async function fetchBalita() {
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
    balitaList.value = data ?? []
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
// eslint-disable-next-line no-unused-vars
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
// BMI CALCULATION & STATUS
// ─────────────────────────────────────────────────────
function calculateBMI(balita) {
  if (!balita.berat_badan || !balita.tinggi_badan) return 0
  // BMI = berat_badan (kg) / (tinggi_badan (cm) / 100)^2
  const tinggiMeter = balita.tinggi_badan / 100
  return balita.berat_badan / (tinggiMeter * tinggiMeter)
}

function getBMIStatus(balita) {
  const bmi = calculateBMI(balita)
  if (bmi < 18.5) return 'Kurus'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Gemuk'
  return 'Obese'
}

function getBMIStatusClass(balita) {
  const bmi = calculateBMI(balita)
  if (bmi < 18.5) return 'kurus'
  if (bmi < 25) return 'normal'
  if (bmi < 30) return 'gemuk'
  return 'obese'
}
</script>
