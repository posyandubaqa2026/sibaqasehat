<template>
  <div class="hasil-penimbangan-wrap">

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

          <p class="gate-hint">
            Hubungi administrator jika lupa password
          </p>
        </div>
      </div>
    </transition>

    <!-- ═══════════════════════════════════════════════
         HALAMAN HASIL PENIMBANGAN (setelah unlock)
         ═══════════════════════════════════════════════ -->
    <transition name="fade" mode="out-in">
      <div v-if="activePosyanduId !== null && isUnlocked" class="penimbangan-page" key="page">

        <!-- ── Toolbar ── -->
        <div class="penimbangan-toolbar">
          <div class="toolbar-left">
            <div class="toolbar-info">
              <span class="toolbar-posyandu">{{ activePosyanduNama }}</span>
              <span class="toolbar-count">{{ filteredHasilPenimbangan.length }} data terdaftar</span>
            </div>
          </div>
          <div class="toolbar-right">
            <div class="search-wrap">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.3"/>
                <path d="M10 10l3.5 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
              <input v-model="searchQuery" placeholder="Cari nama balita" class="search-input"/>
            </div>
            <button class="btn-add" @click="openModal('add')">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Tambah Data
            </button>
          </div>
        </div>

        <!-- ── Error ── -->
        <div v-if="tableError" class="table-error">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#E55353" stroke-width="1.3"/>
            <path d="M8 4v4M8 12h.01" stroke="#E55353" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
          <span>{{ tableError }}</span>
        </div>

        <!-- ── Table ── -->
        <div class="table-wrapper" v-if="!tableLoading">
          <table class="data-table">
            <thead>
              <tr>
                <th class="col-no">No</th>
                <th class="col-nama">Nama Balita</th>
                <th class="col-tgl hide-sm">Tanggal Timbang</th>
                <th class="col-bb hide-xs">Berat Badan (kg)</th>
                <th class="col-tb hide-md">Tinggi Badan (cm)</th>
                <th class="col-input hide-sm">Diinput Oleh</th>
                <th class="col-aksi">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(h, i) in filteredHasilPenimbangan" :key="h.id" class="table-row">
                <td class="col-no">{{ i + 1 }}</td>
                <td class="col-nama">{{ h.nama_balita || '–' }}</td>
                <td class="col-tgl hide-sm">{{ formatDate(h.tanggal_timbang) }}</td>
                <td class="col-bb hide-xs">{{ h.berat_badan ?? '–' }}</td>
                <td class="col-tb hide-md">{{ h.tinggi_badan ?? '–' }}</td>
                <td class="col-input hide-sm">{{ h.created_by ?? '–' }}</td>
                <td class="col-aksi">
                  <div class="aksi-btns">
                    <button class="btn-icon edit" @click="openModal('edit', h)" title="Edit">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                    <button class="btn-icon delete" @click="confirmDelete(h)" title="Hapus">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 4h10M5 4V2h4v2M3 4l1 8h6l1-8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredHasilPenimbangan.length === 0" class="empty-row">
                <td colspan="7" class="empty-cell">Tidak ada data hasil penimbangan</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ── Loading ── -->
        <div v-else class="table-loading">
          <div class="spinner-large"></div>
          <p>Memuat data...</p>
        </div>
      </div>
    </transition>

    <!-- ═══════════════════════════════════════════════
         MODAL TAMBAH / EDIT HASIL PENIMBANGAN
         ═══════════════════════════════════════════════ -->
    <teleport to="body">
      <transition name="modal-fade">
        <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
          <div class="modal-box">
            <div class="modal-header">
              <h3>{{ modalMode === 'add' ? 'Tambah Hasil Penimbangan' : 'Edit Hasil Penimbangan' }}</h3>
              <button class="modal-close" @click="closeModal">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <div class="form-grid">
                <!-- Pilih Balita -->
                <div class="form-group full">
                  <label>Nama Balita <span class="req">*</span></label>
                  <select v-model="form.id_bayi" class="form-input" :class="{ 'is-invalid': formErrors.id_bayi }" :disabled="modalMode === 'edit'">
                    <option value="">Pilih balita...</option>
                    <option v-for="b in daftarBalita" :key="b.id" :value="b.id">
                      {{ b.nama_lengkap }}
                    </option>
                  </select>
                  <span class="field-error" v-if="formErrors.id_bayi">{{ formErrors.id_bayi }}</span>
                </div>

                <!-- Tanggal Timbang -->
                <div class="form-group full">
                  <label>Tanggal Timbang <span class="req">*</span></label>
                  <input type="date" v-model="form.tanggal_timbang" class="form-input" :class="{ 'is-invalid': formErrors.tanggal_timbang }"/>
                  <span class="field-error" v-if="formErrors.tanggal_timbang">{{ formErrors.tanggal_timbang }}</span>
                </div>

                <!-- Berat Badan -->
                <div class="form-group">
                  <label>Berat Badan (kg) <span class="req">*</span></label>
                  <input type="number" step="0.1" v-model="form.berat_badan" placeholder="0.0" class="form-input" :class="{ 'is-invalid': formErrors.berat_badan }"/>
                  <span class="field-error" v-if="formErrors.berat_badan">{{ formErrors.berat_badan }}</span>
                </div>

                <!-- Tinggi Badan -->
                <div class="form-group">
                  <label>Tinggi Badan (cm) <span class="req">*</span></label>
                  <input type="number" step="0.1" v-model="form.tinggi_badan" placeholder="0.0" class="form-input" :class="{ 'is-invalid': formErrors.tinggi_badan }"/>
                  <span class="field-error" v-if="formErrors.tinggi_badan">{{ formErrors.tinggi_badan }}</span>
                </div>

                <!-- Input By -->
                <div class="form-group full">
                  <label>Diinput Oleh <span class="req">*</span></label>
                  <input v-model="form.created_by" placeholder="Nama kader/pembuat" class="form-input" :class="{ 'is-invalid': formErrors.created_by }"/>
                  <span class="field-error" v-if="formErrors.created_by">{{ formErrors.created_by }}</span>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-cancel" @click="closeModal" :disabled="formLoading">Batal</button>
              <button class="btn-save" @click="savePenimbangan" :disabled="formLoading">
                <span v-if="formLoading" class="spinner"></span>
                <span v-else>{{ modalMode === 'add' ? 'Simpan Data' : 'Perbarui Data' }}</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- ═══════════════════════════════════════════════
         MODAL KONFIRMASI DELETE
         ═══════════════════════════════════════════════ -->
    <teleport to="body">
      <transition name="modal-fade">
        <div class="modal-overlay" v-if="showDeleteModal" @click.self="closeDeleteModal">
          <div class="modal-box modal-confirm">
            <div class="confirm-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="#E55353" stroke-width="2"/>
                <path d="M24 14v10M24 32h.02" stroke="#E55353" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3>Hapus Data?</h3>
            <p>Apakah Anda yakin ingin menghapus data hasil penimbangan ini?</p>
            <div class="confirm-btns">
              <button class="btn-cancel" @click="closeDeleteModal" :disabled="formLoading">Batal</button>
              <button class="btn-danger" @click="deletePenimbangan" :disabled="formLoading">
                <span v-if="formLoading" class="spinner"></span>
                <span v-else>Hapus</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- ═══════════════════════════════════════════════
         TOAST NOTIFICATION
         ═══════════════════════════════════════════════ -->
    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast', toast.type]">
        {{ toast.msg }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { createClient } from '@supabase/supabase-js'
import '../assets/HasilPenimbangan.css'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ── Props ──────────────────────────────────────
const props = defineProps({
  activePosyanduId: { type: [String, null], default: null },
  activePosyanduNama: { type: String, default: '' },
  posyanduKeyMap: { type: Object, default: () => ({}) },
  posyanduTableMap: { type: Object, default: () => ({}) }
})

// ─────────────────────────────────────────────────────
// PASSWORD GATE STATE
// ─────────────────────────────────────────────────────
const unlockedMap = ref({})
const pwInput = ref('')
const showPw = ref(false)
const pwError = ref('')
const pwLoading = ref(false)
const pwInputRef = ref(null)

const isUnlocked = computed(() => !!unlockedMap.value[props.activePosyanduId])

watch(() => props.activePosyanduId, () => {
  pwInput.value = ''
  pwError.value = ''
  showPw.value = false
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
  pwError.value = ''
  try {
    const posyanduKey = props.posyanduKeyMap[props.activePosyanduId]
    if (!posyanduKey) throw new Error('Posyandu tidak dikenali')

    const { data, error } = await supabase.rpc('verify_posyandu_password', {
      p_posyandu_key: posyanduKey,
      p_password: pwInput.value,
    })

    if (error) throw new Error(`Gagal verifikasi: ${error.message}`)

    if (data === true) {
      unlockedMap.value[props.activePosyanduId] = true
      pwInput.value = ''
      fetchData()
    } else {
      pwError.value = 'Password salah. Silakan coba lagi.'
      pwInput.value = ''
      nextTick(() => pwInputRef.value?.focus())
    }
  } catch (err) {
    pwError.value = err.message || 'Gagal memverifikasi password. Coba lagi.'
  } finally {
    pwLoading.value = false
  }
}

// ─────────────────────────────────────────────────────
// DATA STATE
// ─────────────────────────────────────────────────────
const hasilPenimbanganList = ref([])
const daftarBalita = ref([])
const tableLoading = ref(false)
const tableError = ref(null)
const searchQuery = ref('')

const filteredHasilPenimbangan = computed(() => {
  let list = hasilPenimbanganList.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p =>
      p.nama_balita?.toLowerCase().includes(q)
    )
  }
  return list
})

async function fetchData() {
  if (!props.activePosyanduId) return
  const tableBalita = props.posyanduTableMap[props.activePosyanduId]
  const posyanduKey = props.posyanduKeyMap[props.activePosyanduId]
  const tablePenimbangan = `hasil_penimbangan_${posyanduKey}`

  if (!tableBalita || !tablePenimbangan) return

  tableLoading.value = true
  tableError.value = null
  try {
    // 1. Fetch daftar balita
    const { data: balitaData, error: balitaError } = await supabase
      .from(tableBalita)
      .select('id, nama_lengkap')
      .order('nama_lengkap')

    if (balitaError) throw balitaError
    daftarBalita.value = balitaData ?? []

    // 2. Fetch hasil penimbangan
    const { data: penimbanganData, error: penimbanganError } = await supabase
      .from(tablePenimbangan)
      .select('*')
      .order('created_at', { ascending: false })

    if (penimbanganError) throw penimbanganError

    // 3. Join dengan nama balita
    const merged = (penimbanganData ?? []).map(p => {
      const balita = daftarBalita.value.find(b => b.id === p.id_bayi)
      return {
        ...p,
        nama_balita: balita?.nama_lengkap || '–'
      }
    })

    hasilPenimbanganList.value = merged
  } catch (err) {
    tableError.value = 'Gagal memuat data: ' + (err.message ?? err)
  } finally {
    tableLoading.value = false
  }
}

// ─────────────────────────────────────────────────────
// MODAL / FORM
// ─────────────────────────────────────────────────────
const showModal = ref(false)
const modalMode = ref('add')
const formLoading = ref(false)
const formErrors = ref({})
const editingId = ref(null)

const emptyForm = () => ({
  id_bayi: '',
  tanggal_timbang: '',
  berat_badan: null,
  tinggi_badan: null,
  created_by: '',
})
const form = ref(emptyForm())

function openModal(mode, data = null) {
  modalMode.value = mode
  formErrors.value = {}
  if (mode === 'edit' && data) {
    editingId.value = data.id
    form.value = {
      id_bayi: data.id_bayi ?? '',
      tanggal_timbang: data.tanggal_timbang ?? '',
      berat_badan: data.berat_badan ?? null,
      tinggi_badan: data.tinggi_badan ?? null,
      created_by: data.created_by ?? '',
    }
  } else {
    editingId.value = null
    form.value = emptyForm()
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  formErrors.value = {}
}

function validateForm() {
  const errors = {}
  if (!form.value.id_bayi) errors.id_bayi = 'Pilih balita terlebih dahulu'
  if (!form.value.tanggal_timbang) errors.tanggal_timbang = 'Tanggal timbang wajib diisi'
  if (!form.value.berat_badan) errors.berat_badan = 'Berat badan wajib diisi'
  if (!form.value.tinggi_badan) errors.tinggi_badan = 'Tinggi badan wajib diisi'
  if (!form.value.created_by?.trim()) errors.created_by = 'Nama kader wajib diisi'
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

async function savePenimbangan() {
  if (!validateForm()) return
  const posyanduKey = props.posyanduKeyMap[props.activePosyanduId]
  const tablePenimbangan = `hasil_penimbangan_${posyanduKey}`

  formLoading.value = true
  try {
    const payload = {
      id_bayi: form.value.id_bayi,
      tanggal_timbang: form.value.tanggal_timbang,
      berat_badan: parseFloat(form.value.berat_badan),
      tinggi_badan: parseFloat(form.value.tinggi_badan),
      created_by: form.value.created_by,
    }

    if (modalMode.value === 'add') {
      const { error } = await supabase.from(tablePenimbangan).insert([payload])
      if (error) throw error
      showToast('Data hasil penimbangan berhasil ditambahkan', 'success')
    } else {
      const { error } = await supabase
        .from(tablePenimbangan)
        .update(payload)
        .eq('id', editingId.value)
      if (error) throw error
      showToast('Data hasil penimbangan berhasil diperbarui', 'success')
    }

    closeModal()
    await fetchData()
  } catch (err) {
    showToast('Gagal menyimpan: ' + (err.message ?? err), 'error')
  } finally {
    formLoading.value = false
  }
}

// ─────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────
const showDeleteModal = ref(false)
const deleteTarget = ref(null)

function confirmDelete(h) {
  deleteTarget.value = h
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deleteTarget.value = null
}

async function deletePenimbangan() {
  const posyanduKey = props.posyanduKeyMap[props.activePosyanduId]
  const tablePenimbangan = `hasil_penimbangan_${posyanduKey}`

  if (!deleteTarget.value) return
  formLoading.value = true
  try {
    const { error } = await supabase
      .from(tablePenimbangan)
      .delete()
      .eq('id', deleteTarget.value.id)
    if (error) throw error
    showToast('Data berhasil dihapus', 'success')
    closeDeleteModal()
    await fetchData()
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
</script>


