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

        <!-- Toolbar -->
        <div class="laporan-toolbar">
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
          <button @click="fetchBalita">Coba Lagi</button>
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
                  <button class="btn-detail" @click="openDetail(b)">
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
      </div>
    </transition>

    <!-- ══════════════════════════════════════════
         MODAL GRAFIK
    ══════════════════════════════════════════ -->
    <teleport to="body">
      <transition name="modal-fade">
        <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
          <div class="modal-box">
            <!-- Header -->
            <div class="modal-header">
              <div class="modal-header-info">
                <div class="modal-avatar" :class="selectedBalita?.jenis_kelamin === 'Laki-laki' ? 'laki' : 'perempuan'">
                  {{ selectedBalita?.nama_lengkap?.[0] ?? '?' }}
                </div>
                <div>
                  <h3>{{ selectedBalita?.nama_lengkap }}</h3>
                  <p class="modal-subtitle">
                    Ibu: {{ selectedBalita?.nama_ibu }} ·
                    {{ selectedBalita?.jenis_kelamin }} ·
                    Usia: {{ calcAge(selectedBalita?.tanggal_lahir) }}
                  </p>
                </div>
              </div>
              <button class="modal-close" @click="closeModal">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <!-- Body: Chart -->
            <div class="modal-body">
              <!-- Z-Score Status -->
              <div class="status-row">
                <div class="status-card" :class="getZScoreClass(selectedBalita)">
                  <span class="status-label">Status Gizi (BB/U)</span>
                  <span class="status-value">{{ getZScoreStatus(selectedBalita) }}</span>
                  <span class="status-zscore">Z-Score: {{ getZScore(selectedBalita).toFixed(2) }}</span>
                </div>
                <div class="stat-card">
                  <span class="stat-label">Berat Badan</span>
                  <span class="stat-value">{{ selectedBalita?.berat_badan ?? '–' }} <small>kg</small></span>
                </div>
                <div class="stat-card">
                  <span class="stat-label">Usia</span>
                  <span class="stat-value">{{ calcAgeMonths(selectedBalita?.tanggal_lahir) }} <small>bln</small></span>
                </div>
              </div>

              <!-- SVG Chart -->
              <div class="chart-container">
                <div class="chart-title">
                  Grafik Berat Badan menurut Umur (BB/U)
                  <span class="chart-subtitle">Standar WHO {{ selectedBalita?.jenis_kelamin === 'Laki-laki' ? '— Laki-laki' : '— Perempuan' }} · 0–60 bulan</span>
                </div>
                <div class="chart-wrap" ref="chartWrap">
                  <svg
                    :viewBox="`0 0 ${SVG_W} ${SVG_H}`"
                    class="who-chart"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <!-- Grid lines -->
                    <g class="grid-lines">
                      <line
                        v-for="m in gridMonths" :key="`gm-${m}`"
                        :x1="xScale(m)" :y1="PAD_TOP"
                        :x2="xScale(m)" :y2="SVG_H - PAD_BOTTOM"
                        stroke="#E8EDF2" stroke-width="1"
                      />
                      <line
                        v-for="w in gridWeights" :key="`gw-${w}`"
                        :x1="PAD_LEFT" :y1="yScale(w)"
                        :x2="SVG_W - PAD_RIGHT" :y2="yScale(w)"
                        stroke="#E8EDF2" stroke-width="1"
                      />
                    </g>

                    <!-- WHO Zone fills -->
                    <!-- Zone SD3 ke atas (Obese, merah muda) -->
                    <polygon
                      :points="fillZone(whoData, 'SD3', 'top')"
                      fill="#FFEBEB" opacity="0.7"
                    />
                    <!-- Zone SD2–SD3 (Overweight, kuning) -->
                    <polygon
                      :points="fillZone(whoData, 'SD2', 'SD3')"
                      fill="#FFF9E6" opacity="0.7"
                    />
                    <!-- Zone SD0–SD2 (Normal, hijau muda) -->
                    <polygon
                      :points="fillZone(whoData, 'SD0', 'SD2')"
                      fill="#EDFAF4" opacity="0.8"
                    />
                    <!-- Zone SD-2–SD0 (Normal bawah, hijau sangat muda) -->
                    <polygon
                      :points="fillZone(whoData, 'SD2neg', 'SD0')"
                      fill="#EDFAF4" opacity="0.8"
                    />
                    <!-- Zone SD-3–SD-2 (Underweight, kuning) -->
                    <polygon
                      :points="fillZone(whoData, 'SD3neg', 'SD2neg')"
                      fill="#FFF9E6" opacity="0.7"
                    />
                    <!-- Zone bawah SD-3 (Severe underweight, merah muda) -->
                    <polygon
                      :points="fillZone(whoData, 'bottom', 'SD3neg')"
                      fill="#FFEBEB" opacity="0.7"
                    />

                    <!-- WHO z-score lines -->
                    <polyline :points="linePath(whoData, 'SD3')"    fill="none" stroke="#DC2626" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.8"/>
                    <polyline :points="linePath(whoData, 'SD2')"    fill="none" stroke="#D97706" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.8"/>
                    <polyline :points="linePath(whoData, 'SD0')"    fill="none" stroke="#16A87A" stroke-width="2"   opacity="1"/>
                    <polyline :points="linePath(whoData, 'SD2neg')" fill="none" stroke="#D97706" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.8"/>
                    <polyline :points="linePath(whoData, 'SD3neg')" fill="none" stroke="#DC2626" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.8"/>

                    <!-- Line labels -->
                    <text :x="xScale(60)+4" :y="yScale(whoData[whoData.length-1].SD3)+4"    font-size="9" fill="#DC2626" font-weight="600">+3</text>
                    <text :x="xScale(60)+4" :y="yScale(whoData[whoData.length-1].SD2)+4"    font-size="9" fill="#D97706" font-weight="600">+2</text>
                    <text :x="xScale(60)+4" :y="yScale(whoData[whoData.length-1].SD0)+4"    font-size="9" fill="#16A87A" font-weight="700">0</text>
                    <text :x="xScale(60)+4" :y="yScale(whoData[whoData.length-1].SD2neg)+4" font-size="9" fill="#D97706" font-weight="600">-2</text>
                    <text :x="xScale(60)+4" :y="yScale(whoData[whoData.length-1].SD3neg)+4" font-size="9" fill="#DC2626" font-weight="600">-3</text>

                    <!-- X Axis ticks & labels -->
                    <g>
                      <line v-for="m in xTicks" :key="`xt-${m}`"
                        :x1="xScale(m)" :y1="SVG_H - PAD_BOTTOM"
                        :x2="xScale(m)" :y2="SVG_H - PAD_BOTTOM + 4"
                        stroke="#BCC5CC" stroke-width="1"
                      />
                      <text v-for="m in xTicks" :key="`xl-${m}`"
                        :x="xScale(m)" :y="SVG_H - PAD_BOTTOM + 14"
                        text-anchor="middle" font-size="9" fill="#6B7B8A"
                      >{{ m }}</text>
                    </g>

                    <!-- Y Axis ticks & labels -->
                    <g>
                      <text v-for="w in gridWeights" :key="`yl-${w}`"
                        :x="PAD_LEFT - 6" :y="yScale(w) + 3.5"
                        text-anchor="end" font-size="9" fill="#6B7B8A"
                      >{{ w }}</text>
                    </g>

                    <!-- Axis lines -->
                    <line :x1="PAD_LEFT" :y1="PAD_TOP" :x2="PAD_LEFT" :y2="SVG_H - PAD_BOTTOM" stroke="#BCC5CC" stroke-width="1.2"/>
                    <line :x1="PAD_LEFT" :y1="SVG_H - PAD_BOTTOM" :x2="SVG_W - PAD_RIGHT" :y2="SVG_H - PAD_BOTTOM" stroke="#BCC5CC" stroke-width="1.2"/>

                    <!-- Axis titles -->
                    <text :x="SVG_W/2" :y="SVG_H - 4" text-anchor="middle" font-size="10" fill="#6B7B8A" font-weight="600">Umur (bulan)</text>
                    <text
                      :x="12" :y="SVG_H/2"
                      text-anchor="middle" font-size="10" fill="#6B7B8A" font-weight="600"
                      :transform="`rotate(-90, 12, ${SVG_H/2})`"
                    >Berat Badan (kg)</text>

                    <!-- Vertical indicator line at child's age -->
                    <line
                      v-if="childAge !== null && childAge <= 60"
                      :x1="xScale(childAge)" :y1="PAD_TOP"
                      :x2="xScale(childAge)" :y2="SVG_H - PAD_BOTTOM"
                      stroke="#2F9D94" stroke-width="1" stroke-dasharray="3 2" opacity="0.6"
                    />

                    <!-- Child dot -->
                    <g v-if="childAge !== null && selectedBalita?.berat_badan && childAge <= 60">
                      <!-- outer ring -->
                      <circle
                        :cx="xScale(childAge)"
                        :cy="yScale(selectedBalita.berat_badan)"
                        r="7" :fill="dotColor" opacity="0.2"
                      />
                      <!-- inner dot -->
                      <circle
                        :cx="xScale(childAge)"
                        :cy="yScale(selectedBalita.berat_badan)"
                        r="4.5" :fill="dotColor" stroke="white" stroke-width="1.5"
                      />
                      <!-- tooltip bubble -->
                      <g>
                        <rect
                          :x="xScale(childAge) - 24"
                          :y="yScale(selectedBalita.berat_badan) - 26"
                          width="48" height="18" rx="5"
                          :fill="dotColor"
                        />
                        <text
                          :x="xScale(childAge)"
                          :y="yScale(selectedBalita.berat_badan) - 13"
                          text-anchor="middle" font-size="9" fill="white" font-weight="700"
                        >{{ selectedBalita.berat_badan }} kg</text>
                      </g>
                    </g>

                  </svg>
                </div>

                <!-- Legend -->
                <div class="chart-legend">
                  <div class="legend-item">
                    <span class="legend-line" style="background:#16A87A; height:2px;"></span>
                    <span>Median (0)</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-line" style="background:#D97706; border-top: 2px dashed #D97706; height:0;"></span>
                    <span>±2 SD</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-line" style="background:#DC2626; border-top: 2px dashed #DC2626; height:0;"></span>
                    <span>±3 SD</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-dot" :style="`background:${dotColor}`"></span>
                    <span>{{ selectedBalita?.nama_lengkap }}</span>
                  </div>
                </div>
              </div>
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
import { ref, computed, watch, nextTick } from 'vue'
import { createClient } from '@supabase/supabase-js'
import '../assets/LaporanBulanan.css'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ── Props ────────────────────────────────────────────────
const props = defineProps({
  activePosyanduId:   { type: [String, null], default: null },
  activePosyanduNama: { type: String, default: '' },
  posyanduKeyMap:     { type: Object, default: () => ({}) },
  posyanduTableMap:   { type: Object, default: () => ({}) },
})

// ── Password Gate ────────────────────────────────────────
const unlockedMap = ref({})
const pwInput     = ref('')
const showPw      = ref(false)
const pwError     = ref('')
const pwLoading   = ref(false)
const pwInputRef  = ref(null)

const isUnlocked = computed(() => !!unlockedMap.value[props.activePosyanduId])

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
  if (!pwInput.value.trim()) { pwError.value = 'Password tidak boleh kosong'; return }
  pwLoading.value = true
  pwError.value   = ''
  try {
    const posyanduKey = props.posyanduKeyMap[props.activePosyanduId]
    if (!posyanduKey) throw new Error('Posyandu tidak dikenali')
    const { data, error } = await supabase.rpc('verify_posyandu_password', {
      p_posyandu_key: posyanduKey,
      p_password:     pwInput.value,
    })
    if (error) throw new Error(`Gagal verifikasi: ${error.message}`)
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
    pwError.value = err.message || 'Gagal memverifikasi password.'
  } finally {
    pwLoading.value = false
  }
}

function lockPage() {
  if (props.activePosyanduId) {
    delete unlockedMap.value[props.activePosyanduId]
    unlockedMap.value = { ...unlockedMap.value }
    balitaList.value  = []
  }
}

// ── Data ─────────────────────────────────────────────────
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

    const posyanduKey    = props.posyanduKeyMap[props.activePosyanduId]
    const hasilTableName = `hasil_penimbangan_${posyanduKey}`
    const { data: hasilData } = await supabase
      .from(hasilTableName)
      .select('id_bayi, berat_badan, created_at')
      .order('created_at', { ascending: false })

    const hasilMap = {}
    if (hasilData) {
      hasilData.forEach(h => {
        if (h.id_bayi && !hasilMap[h.id_bayi]) hasilMap[h.id_bayi] = { berat_badan: h.berat_badan }
      })
    }

    balitaList.value = (data ?? []).map(b => ({
      ...b,
      berat_badan: hasilMap[b.id]?.berat_badan ?? b.berat_badan,
    }))
  } catch (err) {
    tableError.value = 'Gagal memuat data: ' + (err.message ?? err)
  } finally {
    tableLoading.value = false
  }
}

// ── Modal & Chart ─────────────────────────────────────────
const showModal      = ref(false)
const selectedBalita = ref(null)

function openDetail(b) {
  selectedBalita.value = b
  showModal.value      = true
  document.body.style.overflow = 'hidden'
}
function closeModal() {
  showModal.value = false
  document.body.style.overflow = ''
}

// ── Helpers ───────────────────────────────────────────────
function calcAgeMonths(dob) {
  if (!dob) return null
  const today = new Date()
  const birth = new Date(dob)
  return (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())
}

function calcAge(dob) {
  const m = calcAgeMonths(dob)
  if (m === null) return '–'
  if (m < 24) return `${m} bulan`
  return `${Math.floor(m / 12)} tahun ${m % 12} bulan`
}

const childAge = computed(() => calcAgeMonths(selectedBalita.value?.tanggal_lahir))

// ── WHO Weight-for-Age z-scores (0–60 bulan, tiap 1 bulan)
// Sumber: WHO Child Growth Standards — wfa boys/girls z-scores
// Keys: bulan, SD3neg (-3SD), SD2neg (-2SD), SD0 (median), SD2 (+2SD), SD3 (+3SD)
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

const whoData = computed(() =>
  selectedBalita.value?.jenis_kelamin === 'Laki-laki' ? WHO_BOYS : WHO_GIRLS
)

// ── Z-Score calculation ──────────────────────────────────
function getZScore(balita) {
  if (!balita?.berat_badan || !balita?.tanggal_lahir) return 0
  const ageM = calcAgeMonths(balita.tanggal_lahir)
  if (ageM === null || ageM > 60) return 0
  const table = balita.jenis_kelamin === 'Laki-laki' ? WHO_BOYS : WHO_GIRLS
  const row   = table.find(r => r.m === Math.round(ageM)) ?? table[0]
  const W     = balita.berat_badan
  // Estimasi linear antara SD points
  if (W >= row.SD0) {
    const range = row.SD2 - row.SD0
    return range > 0 ? (W - row.SD0) / range * 2 : 0
  } else {
    const range = row.SD0 - row.SD2neg
    return range > 0 ? (W - row.SD0) / range * 2 : 0
  }
}

function getZScoreStatus(balita) {
  const z = getZScore(balita)
  if (z < -3)      return 'Gizi Buruk'
  if (z < -2)      return 'Gizi Kurang'
  if (z <= 1)      return 'Gizi Baik'
  if (z <= 2)      return 'Berisiko Lebih'
  if (z <= 3)      return 'Gizi Lebih'
  return 'Obesitas'
}

function getZScoreClass(balita) {
  const z = getZScore(balita)
  if (z < -3)  return 'status-buruk'
  if (z < -2)  return 'status-kurang'
  if (z <= 1)  return 'status-baik'
  if (z <= 2)  return 'status-risiko'
  return 'status-lebih'
}

const dotColor = computed(() => {
  const z = getZScore(selectedBalita.value)
  if (z < -3)  return '#DC2626'
  if (z < -2)  return '#D97706'
  if (z <= 1)  return '#16A87A'
  if (z <= 2)  return '#D97706'
  return '#DC2626'
})

// ── SVG Chart helpers ─────────────────────────────────────
const SVG_W      = 560
const SVG_H      = 320
const PAD_LEFT   = 44
const PAD_RIGHT  = 28
const PAD_TOP    = 20
const PAD_BOTTOM = 36

const MIN_WEIGHT = 0
const MAX_WEIGHT = 30
const MIN_MONTH  = 0
const MAX_MONTH  = 60

function xScale(m)   { return PAD_LEFT + (m - MIN_MONTH) / (MAX_MONTH - MIN_MONTH) * (SVG_W - PAD_LEFT - PAD_RIGHT) }
function yScale(w)   { return SVG_H - PAD_BOTTOM - (w - MIN_WEIGHT) / (MAX_WEIGHT - MIN_WEIGHT) * (SVG_H - PAD_TOP - PAD_BOTTOM) }

function linePath(data, key) {
  return data.map(d => `${xScale(d.m)},${yScale(d[key])}`).join(' ')
}

function fillZone(data, keyBottom, keyTop) {
  const top    = keyTop    === 'top'    ? data.map(d => `${xScale(d.m)},${yScale(MAX_WEIGHT)}`) : data.map(d => `${xScale(d.m)},${yScale(d[keyTop])}`)
  const bottom = keyBottom === 'bottom' ? [...data].reverse().map(d => `${xScale(d.m)},${yScale(MIN_WEIGHT)}`) : [...data].reverse().map(d => `${xScale(d.m)},${yScale(d[keyBottom])}`)
  return [...top, ...bottom].join(' ')
}

const gridMonths  = [0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60]
const xTicks      = [0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60]
const gridWeights = [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30]

// ── Toast ─────────────────────────────────────────────────
const toast = ref({ show: false, msg: '', type: 'success' })
let toastTimer = null
// eslint-disable-next-line no-unused-vars
function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  toast.value = { show: true, msg, type }
  toastTimer  = setTimeout(() => { toast.value.show = false }, 3200)
}
</script>
