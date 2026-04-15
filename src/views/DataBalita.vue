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
         HALAMAN DATA BALITA (setelah unlock)
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
            <button class="btn-add" @click="openModal('add')">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              </svg>
              Tambah Balita
            </button>
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
          <span>Memuat data balita...</span>
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
          <p>{{ searchQuery || filterGender ? 'Tidak ada data yang cocok dengan filter' : 'Belum ada data balita. Klik "Tambah Balita" untuk mulai.' }}</p>
        </div>

        <!-- ── Table ── -->
        <div class="table-wrap" v-else>
          <table class="balita-table">
            <thead>
              <tr>
                <th class="col-no">No</th>
                <th class="col-nama">Nama Balita</th>
                <th class="col-ibu hide-sm">Nama Ibu</th>
                <th class="col-lahir hide-sm">Tanggal Lahir</th>
                <th class="col-usia">Usia</th>
                <th class="col-jk hide-xs">Jenis Kelamin</th>
                <th class="col-bb hide-md">Berat Badan (kg)</th>
                <th class="col-tb hide-md">Tinggi Badan (cm)</th>
                <th class="col-ket hide-sm">Keterangan</th>
                <th class="col-aksi">Aksi</th>
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
                <td class="col-ibu hide-sm">{{ b.nama_ibu }}</td>
                <td class="col-lahir hide-sm">{{ formatDate(b.tanggal_lahir) }}</td>
                <td class="col-usia">{{ calcAge(b.tanggal_lahir) }}</td>
                <td class="col-jk hide-xs">
                  <span class="jk-badge" :class="b.jenis_kelamin === 'Laki-laki' ? 'laki' : 'perempuan'">
                    {{ b.jenis_kelamin === 'Laki-laki' ? 'L' : 'P' }}
                  </span>
                </td>
                <td class="col-bb hide-md">{{ b.berat_badan ?? '–' }}</td>
                <td class="col-tb hide-md">{{ b.tinggi_badan ?? '–' }}</td>
                <td class="col-ket hide-sm">{{ b.keterangan || '–' }}</td>
                <td class="col-aksi">
                  <div class="aksi-btns">
                    <button class="btn-icon edit" @click="openModal('edit', b)" title="Edit">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                    <button class="btn-icon delete" @click="confirmDelete(b)" title="Hapus">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 4h10M5 4V2h4v2M3 4l1 8h6l1-8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </transition>

    <!-- ═══════════════════════════════════════════════
         MODAL TAMBAH / EDIT
         ═══════════════════════════════════════════════ -->
    <teleport to="body">
      <transition name="modal-fade">
        <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
          <div class="modal-box">
            <div class="modal-header">
              <h3>{{ modalMode === 'add' ? 'Tambah Data Balita' : 'Edit Data Balita' }}</h3>
              <button class="modal-close" @click="closeModal">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <div class="form-grid">
                <!-- Nama Balita -->
                <div class="form-group full">
                  <label>Nama Balita <span class="req">*</span></label>
                  <input v-model="form.nama_lengkap" placeholder="Masukkan nama lengkap balita" class="form-input" :class="{ 'is-invalid': formErrors.nama_lengkap }"/>
                  <span class="field-error" v-if="formErrors.nama_lengkap">{{ formErrors.nama_lengkap }}</span>
                </div>

                <!-- Tanggal Lahir -->
                <div class="form-group">
                  <label>Tanggal Lahir <span class="req">*</span></label>
                  <input type="date" v-model="form.tanggal_lahir" class="form-input" :class="{ 'is-invalid': formErrors.tanggal_lahir }"/>
                  <span class="field-error" v-if="formErrors.tanggal_lahir">{{ formErrors.tanggal_lahir }}</span>
                </div>

                <!-- Jenis Kelamin -->
                <div class="form-group">
                  <label>Jenis Kelamin <span class="req">*</span></label>
                  <select v-model="form.jenis_kelamin" class="form-input" :class="{ 'is-invalid': formErrors.jenis_kelamin }">
                    <option value="">Pilih...</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                  <span class="field-error" v-if="formErrors.jenis_kelamin">{{ formErrors.jenis_kelamin }}</span>
                </div>

                <!-- Divider Ibu -->
                <div class="form-divider full">
                  <span>Data Orang Tua</span>
                </div>

                <!-- Nama Ibu -->
                <div class="form-group full">
                  <label>Nama Ibu <span class="req">*</span></label>
                  <input v-model="form.nama_ibu" placeholder="Nama ibu kandung" class="form-input" :class="{ 'is-invalid': formErrors.nama_ibu }"/>
                  <span class="field-error" v-if="formErrors.nama_ibu">{{ formErrors.nama_ibu }}</span>
                </div>

                <!-- Divider Input -->
                <div class="form-divider full">
                  <span>Data Input</span>
                </div>

                <!-- Pembuat/Kader -->
                <div class="form-group full">
                  <label>Pembuat/Kader <span class="req">*</span></label>
                  <input v-model="form.created_by" placeholder="Nama kader/pembuat" class="form-input" :class="{ 'is-invalid': formErrors.created_by }"/>
                  <span class="field-error" v-if="formErrors.created_by">{{ formErrors.created_by }}</span>
                </div>

                <!-- Divider Timbang -->
                <div class="form-divider full">
                  <span>Data Penimbangan Terakhir</span>
                </div>

                <div class="form-group">
                  <label>Berat Badan (kg)</label>
                  <input type="number" step="0.1" v-model="form.berat_badan" placeholder="0.0" class="form-input"/>
                </div>

                <div class="form-group">
                  <label>Tinggi Badan (cm)</label>
                  <input type="number" step="0.1" v-model="form.tinggi_badan" placeholder="0.0" class="form-input"/>
                </div>

                <div class="form-group full">
                  <label>Tanggal Timbang</label>
                  <input type="date" v-model="form.tanggal_timbang" class="form-input"/>
                </div>

                <div class="form-group full">
                  <label>Keterangan</label>
                  <textarea v-model="form.keterangan" placeholder="Catatan tambahan (opsional)" class="form-input form-textarea" rows="2"></textarea>
                </div>

              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-cancel" @click="closeModal" :disabled="formLoading">Batal</button>
              <button class="btn-save" @click="saveBalita" :disabled="formLoading">
                <span v-if="formLoading" class="spinner"></span>
                <span v-else>{{ modalMode === 'add' ? 'Simpan Data' : 'Perbarui Data' }}</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- ═══════════════════════════════════════════════
         MODAL KONFIRMASI HAPUS
         ═══════════════════════════════════════════════ -->
    <teleport to="body">
      <transition name="modal-fade">
        <div class="modal-overlay" v-if="showDeleteModal" @click.self="showDeleteModal = false">
          <div class="modal-box modal-sm">
            <div class="modal-header danger">
              <h3>Hapus Data Balita</h3>
              <button class="modal-close" @click="showDeleteModal = false">
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
              <p>Apakah kamu yakin ingin menghapus data <strong>{{ deleteTarget?.nama_lengkap }}</strong>?</p>
              <p class="delete-warn">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" @click="showDeleteModal = false" :disabled="formLoading">Batal</button>
              <button class="btn-delete" @click="deleteBalita" :disabled="formLoading">
                <span v-if="formLoading" class="spinner"></span>
                <span v-else>Ya, Hapus</span>
              </button>
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
  // Map dari posyandu id → key vault (contoh: 'singkil', 'lobak', dll)
  posyanduKeyMap: {
    type: Object,
    default: () => ({})
  },
  // Map dari posyandu id → nama tabel (contoh: 'balita_singkil', 'balita_lobak', dll)
  posyanduTableMap: {
    type: Object,
    default: () => ({})
  }
})

// ─────────────────────────────────────────────────────
// PASSWORD GATE STATE
// Menyimpan unlock state per posyandu di session memory
// -─────────────────────────────────────────────────────
const unlockedMap = ref({})   // { [posyanduId]: true }
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

    // Panggil RPC function di Supabase (SECURITY DEFINER — password aman)
    const { data, error } = await supabase.rpc('verify_posyandu_password', {
      p_posyandu_key: posyanduKey,
      p_password:     pwInput.value,
    })

    if (error) {
      console.error('[submitPassword] RPC Error:', error)
      throw new Error(`Gagal verifikasi: ${error.message}`)
    }

    console.log('[submitPassword] RPC Result:', data)

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
// MODAL / FORM
// ─────────────────────────────────────────────────────
const showModal  = ref(false)
const modalMode  = ref('add')   // 'add' | 'edit'
const formLoading = ref(false)
const formErrors  = ref({})
const editingId   = ref(null)

const emptyForm = () => ({
  nama_lengkap: '', tanggal_lahir: '',
  jenis_kelamin: '', nama_ibu: '', created_by: '',
  berat_badan: null,
  tinggi_badan: null, tanggal_timbang: null, keterangan: '',
})
const form = ref(emptyForm())

function openModal(mode, data = null) {
  modalMode.value  = mode
  formErrors.value = {}
  if (mode === 'edit' && data) {
    editingId.value = data.id
    form.value = {
      nama_lengkap:   data.nama_lengkap   ?? '',
      tanggal_lahir:  data.tanggal_lahir  ?? '',
      jenis_kelamin:  data.jenis_kelamin  ?? '',
      nama_ibu:       data.nama_ibu       ?? '',
      created_by:     data.created_by     ?? '',
      berat_badan:    data.berat_badan    ?? null,
      tinggi_badan:   data.tinggi_badan   ?? null,
      tanggal_timbang: data.created_at    ?? null,
      keterangan:     data.keterangan     ?? '',
    }
  } else {
    editingId.value = null
    form.value = emptyForm()
  }
  showModal.value = true
}

function closeModal() {
  showModal.value  = false
  formErrors.value = {}
}

function validateForm() {
  const errors = {}
  if (!form.value.nama_lengkap?.trim())  errors.nama_lengkap   = 'Nama balita wajib diisi'
  if (!form.value.tanggal_lahir)        errors.tanggal_lahir = 'Tanggal lahir wajib diisi'
  if (!form.value.jenis_kelamin)        errors.jenis_kelamin = 'Jenis kelamin wajib dipilih'
  if (!form.value.nama_ibu?.trim())     errors.nama_ibu      = 'Nama ibu wajib diisi'
  if (!form.value.created_by?.trim())   errors.created_by    = 'Pembuat/kader wajib diisi'
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

async function saveBalita() {
  if (!validateForm()) return
  const tableName = props.posyanduTableMap[props.activePosyanduId]
  if (!tableName) return

  formLoading.value = true
  try {
    const payload = { ...form.value }
    // Jangan kirim tanggal_timbang (gunakan created_at dari Supabase)
    delete payload.tanggal_timbang
    // Bersihkan string kosong jadi null untuk field opsional
    ;['berat_badan','tinggi_badan','keterangan']
    .forEach(k => { if (payload[k] === '' || payload[k] === undefined) payload[k] = null })

    if (modalMode.value === 'add') {
      const { error } = await supabase.from(tableName).insert(payload)
      if (error) throw error
      showToast('Data balita berhasil ditambahkan', 'success')
    } else {
      const { error } = await supabase.from(tableName).update(payload).eq('id', editingId.value)
      if (error) throw error
      showToast('Data balita berhasil diperbarui', 'success')
    }
    closeModal()
    await fetchBalita()
  } catch (err) {
    console.error(err)
    showToast('Gagal menyimpan: ' + (err.message ?? err), 'error')
  } finally {
    formLoading.value = false
  }
}

// ─────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────
const showDeleteModal = ref(false)
const deleteTarget    = ref(null)

function confirmDelete(b) {
  deleteTarget.value    = b
  showDeleteModal.value = true
}

async function deleteBalita() {
  const tableName = props.posyanduTableMap[props.activePosyanduId]
  if (!tableName || !deleteTarget.value) return
  formLoading.value = true
  try {
    // Hard delete (permanent)
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', deleteTarget.value.id)
    if (error) throw error
    showToast('Data berhasil dihapus', 'success')
    showDeleteModal.value = false
    await fetchBalita()
  } catch (err) {
    showToast('Gagal menghapus: ' + (err.message ?? err), 'error')
  } finally {
    formLoading.value = false
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
function formatDate(d) {
  if (!d) return '–'
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function calcAge(dob) {
  if (!dob) return '–'
  const today  = new Date()
  const birth  = new Date(dob)
  const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())
  if (months < 24) return `${months} bln`
  return `${Math.floor(months / 12)} thn`
}
</script>
