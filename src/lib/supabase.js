// src/lib/supabase.js
// ──────────────────────────────────────────────
// Supabase client singleton untuk SiBaqaSehat
// ──────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// ──────────────────────────────────────────────
// Auth helpers
// ──────────────────────────────────────────────
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function signInWithEmail(email, password) {
  return await supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return await supabase.auth.signOut()
}

export async function getCurrentPetugas() {
  const session = await getSession()
  if (!session) return null
  const { data } = await supabase
    .from('petugas')
    .select('*, posyandu(*)')
    .eq('user_id', session.user.id)
    .eq('aktif', true)
    .single()
  return data
}

// ──────────────────────────────────────────────
// Dashboard queries
// ──────────────────────────────────────────────
export async function getRingkasanPosyandu() {
  const { data, error } = await supabase
    .from('v_ringkasan_posyandu')
    .select('*')
    .order('nama')
  return { data, error }
}

export async function getStatusGiziBulanIni() {
  const { data, error } = await supabase
    .from('v_status_gizi_bulan_ini')
    .select('*')
  return { data, error }
}

export async function getKegiatanMendatang(limit = 10) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('kegiatan')
    .select('*, posyandu(nama)')
    .gte('tanggal', today)
    .eq('status', 'terjadwal')
    .order('tanggal')
    .limit(limit)
  return { data, error }
}

export async function getStatistikBulanan(tahun) {
  const { data, error } = await supabase
    .from('penimbangan')
    .select('tanggal, posyandu_id')
    .gte('tanggal', `${tahun}-01-01`)
    .lte('tanggal', `${tahun}-12-31`)
  return { data, error }
}

// ──────────────────────────────────────────────
// CRUD Warga (Balita)
// ──────────────────────────────────────────────
export async function getWarga(posyanduId = null) {
  let query = supabase
    .from('warga')
    .select('*, posyandu(nama)')
    .eq('status_aktif', true)
    .order('nama_balita')
  if (posyanduId) query = query.eq('posyandu_id', posyanduId)
  return await query
}

export async function createWarga(data) {
  return await supabase.from('warga').insert(data).select().single()
}

export async function updateWarga(id, data) {
  return await supabase.from('warga').update(data).eq('id', id).select().single()
}

// ──────────────────────────────────────────────
// CRUD Penimbangan
// ──────────────────────────────────────────────
export async function getPenimbangan(posyanduId = null, bulan = null, tahun = null) {
  let query = supabase
    .from('penimbangan')
    .select('*, warga(nama_balita, nama_ibu), posyandu(nama)')
    .order('tanggal', { ascending: false })

  if (posyanduId) query = query.eq('posyandu_id', posyanduId)
  if (bulan && tahun) {
    const from = `${tahun}-${String(bulan).padStart(2,'0')}-01`
    const to   = new Date(tahun, bulan, 0).toISOString().split('T')[0]
    query = query.gte('tanggal', from).lte('tanggal', to)
  }
  return await query
}

export async function createPenimbangan(data) {
  return await supabase.from('penimbangan').insert(data).select().single()
}

// ──────────────────────────────────────────────
// CRUD Imunisasi
// ──────────────────────────────────────────────
export async function getImunisasi(posyanduId = null) {
  let query = supabase
    .from('imunisasi')
    .select('*, warga(nama_balita), posyandu(nama)')
    .order('tanggal', { ascending: false })
  if (posyanduId) query = query.eq('posyandu_id', posyanduId)
  return await query
}

export async function createImunisasi(data) {
  return await supabase.from('imunisasi').insert(data).select().single()
}

// ──────────────────────────────────────────────
// CRUD Ibu Hamil
// ──────────────────────────────────────────────
export async function getIbuHamil(posyanduId = null) {
  let query = supabase
    .from('ibu_hamil')
    .select('*, posyandu(nama)')
    .eq('status', 'aktif')
    .order('nama')
  if (posyanduId) query = query.eq('posyandu_id', posyanduId)
  return await query
}

export async function createIbuHamil(data) {
  return await supabase.from('ibu_hamil').insert(data).select().single()
}

// ──────────────────────────────────────────────
// CRUD Lansia
// ──────────────────────────────────────────────
export async function getLansia(posyanduId = null) {
  let query = supabase
    .from('lansia')
    .select('*, posyandu(nama)')
    .eq('status_aktif', true)
    .order('nama')
  if (posyanduId) query = query.eq('posyandu_id', posyanduId)
  return await query
}

// ──────────────────────────────────────────────
// CRUD Kegiatan
// ──────────────────────────────────────────────
export async function getKegiatan(posyanduId = null) {
  let query = supabase
    .from('kegiatan')
    .select('*, posyandu(nama)')
    .order('tanggal', { ascending: false })
  if (posyanduId) query = query.eq('posyandu_id', posyanduId)
  return await query
}

export async function createKegiatan(data) {
  return await supabase.from('kegiatan').insert(data).select().single()
}

// ──────────────────────────────────────────────
// CRUD Stok Obat
// ──────────────────────────────────────────────
export async function getStokObat(posyanduId = null) {
  let query = supabase
    .from('stok_obat')
    .select('*, posyandu(nama)')
    .order('tanggal', { ascending: false })
  if (posyanduId) query = query.eq('posyandu_id', posyanduId)
  return await query
}

// ──────────────────────────────────────────────
// Petugas
// ──────────────────────────────────────────────
export async function getPetugas(posyanduId = null) {
  let query = supabase
    .from('petugas')
    .select('*, posyandu(nama)')
    .eq('aktif', true)
    .order('nama')
  if (posyanduId) query = query.eq('posyandu_id', posyanduId)
  return await query
}

export async function createPetugas(data) {
  return await supabase.from('petugas').insert(data).select().single()
}
