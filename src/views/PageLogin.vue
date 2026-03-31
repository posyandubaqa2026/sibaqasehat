<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'

// ── Router ──
const router = useRouter()

// ── State ───
const email = ref('')
const password = ref('')
const showPass = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// ── Derived ──
const inputType = computed(() => (showPass.value ? 'text' : 'password'))
const isFormValid = computed(() => email.value.trim() !== '' && password.value.trim() !== '')

// ── Helpers ──
function clearMessages() {
  errorMsg.value = ''
  successMsg.value = ''
}

// ── Login Handler ──
async function handleLogin() {
  clearMessages()
  if (!isFormValid.value) {
    errorMsg.value = 'Email dan password wajib diisi.'
    return
  }

  isLoading.value = true
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value,
    })

    if (error) {
      errorMsg.value = 'Email atau password salah. Silakan coba lagi.'
      return
    }

    successMsg.value = `Selamat datang, ${data.user.email}! Login berhasil.`
    setTimeout(() => {
      router.push('/home')
    }, 1500)
  } catch (err) {
    errorMsg.value = err.message ?? 'Terjadi kesalahan. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="page">
    <!-- ── Brand Panel — selalu tampil, berubah orientasi di mobile ── -->
    <aside class="brand-panel">
      <div class="brand-bg-shape shape1" />
      <div class="brand-bg-shape shape2" />

      <!-- Mode desktop: konten vertikal penuh -->
      <div class="brand-content brand-content--desktop">
        <div class="brand-logo">
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="56" height="56" rx="16" fill="#2F9D94" opacity=".18" />
            <path
              d="M28 10 C18 10 10 18 10 28 C10 38 18 46 28 46 C38 46 46 38 46 28 C46 18 38 10 28 10Z"
              stroke="#F7F6F2"
              stroke-width="2"
              fill="none"
            />
            <path
              d="M22 28 L26 32 L34 24"
              stroke="#F7F6F2"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="28" cy="28" r="6" fill="#2F9D94" opacity=".4" />
          </svg>
        </div>
        <h1 class="brand-name">SiBaqa Sehat</h1>
        <p class="brand-sub">Sistem Informasi Baqa Sehat</p>
        <div class="brand-divider" />
        <p class="brand-tagline">
          Kelola layanan kesehatan dengan lebih cerdas, efisien, dan terpercaya.
        </p>
        <ul class="brand-features">
          <li><span class="feat-dot" />Manajemen Data Pasien</li>
          <li><span class="feat-dot" />Rekam Medis Digital</li>
          <li><span class="feat-dot" />Laporan &amp; Analitik</li>
        </ul>
      </div>

      <!-- Mode mobile: konten horizontal ringkas -->
      <div class="brand-content brand-content--mobile">
        <svg
          width="40"
          height="40"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="56" height="56" rx="16" fill="#2F9D94" opacity=".18" />
          <path
            d="M28 10 C18 10 10 18 10 28 C10 38 18 46 28 46 C38 46 46 38 46 28 C46 18 38 10 28 10Z"
            stroke="#F7F6F2"
            stroke-width="2"
            fill="none"
          />
          <path
            d="M22 28 L26 32 L34 24"
            stroke="#F7F6F2"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="28" cy="28" r="6" fill="#2F9D94" opacity=".4" />
        </svg>
        <div>
          <h1 class="brand-name">SiBaqa Sehat</h1>
          <p class="brand-sub">Sistem Informasi Baqa Sehat</p>
        </div>
      </div>

      <div class="brand-footer-text">© 2025 SiBaqa Sehat</div>
    </aside>

    <!-- ── Form Panel ── -->
    <main class="form-panel">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Masuk ke Akun</h2>
          <p class="card-desc">Selamat datang kembali, silakan login untuk melanjutkan.</p>
        </div>

        <!-- Alert Error -->
        <transition name="fade">
          <div v-if="errorMsg" class="alert alert--error" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              <path
                d="M12 8v4M12 16h.01"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            {{ errorMsg }}
          </div>
        </transition>

        <!-- Alert Sukses -->
        <transition name="fade">
          <div v-if="successMsg" class="alert alert--success" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              <path
                d="M9 12l2 2 4-4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ successMsg }}
          </div>
        </transition>

        <form class="form" @submit.prevent="handleLogin" novalidate>
          <!-- Email -->
          <div class="field">
            <label class="label" for="email">Email</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="2"
                    y="4"
                    width="20"
                    height="16"
                    rx="3"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                  <path
                    d="M2 8l10 6 10-6"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <input
                id="email"
                v-model="email"
                type="email"
                class="input"
                placeholder="example@gmail.com"
                autocomplete="email"
                :disabled="isLoading"
                @input="clearMessages"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="field">
            <label class="label" for="password">Password</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="5"
                    y="11"
                    width="14"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                  <path
                    d="M8 11V7a4 4 0 018 0v4"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                </svg>
              </span>
              <input
                id="password"
                v-model="password"
                :type="inputType"
                class="input input--pad-right"
                placeholder="••••••••"
                autocomplete="current-password"
                :disabled="isLoading"
                @input="clearMessages"
              />
              <button
                type="button"
                class="toggle-pass"
                :aria-label="showPass ? 'Sembunyikan password' : 'Tampilkan password'"
                @click="showPass = !showPass"
              >
                <svg v-if="showPass" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                  <path
                    d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                  <path
                    d="M1 1l22 22"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                  <path
                    d="M10.73 10.73A3 3 0 0013.27 13.27"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button type="submit" class="btn-login" :disabled="isLoading || !isFormValid">
            <span v-if="!isLoading">Masuk</span>
            <span v-else class="spinner-wrap">
              <span class="spinner" />
              Memproses…
            </span>
          </button>
        </form>

        <p class="card-note">
          Sistem ini hanya dapat diakses oleh administrator yang telah terdaftar.
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

/*
  Tambahkan ini di file CSS global / App.vue agar halaman login
  benar-benar pas satu layar tanpa scroll:

  html, body { height: 100%; overflow: hidden; }

  Atau jika hanya halaman ini yang perlu, gunakan Vue lifecycle hook
  untuk toggle class pada body.
*/

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ─────────────────────────────────────────
   Layout Utama — desktop: row, mobile: column
───────────────────────────────────────── */
.page {
  display: flex;
  height: 100vh; /* tepat satu layar, tidak bisa di-scroll */
  overflow: hidden; /* pastikan tidak ada yang melebihi viewport */
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
  background: #f7f6f2;
}

/* ─────────────────────────────────────────
   Brand Panel
───────────────────────────────────────── */
.brand-panel {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0; /* jangan menyusut di semua ukuran */
  width: 42%;
  background: linear-gradient(145deg, #063154 0%, #025f67 60%, #2f9d94 100%);
  padding: 56px 52px;
  color: #f7f6f2;
}

.brand-bg-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
  background: #f7f6f2;
}
.shape1 {
  width: 380px;
  height: 380px;
  top: -100px;
  right: -140px;
}
.shape2 {
  width: 260px;
  height: 260px;
  bottom: -60px;
  left: -80px;
}

/* Konten desktop: vertikal */
.brand-content--desktop {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
}
/* Konten mobile: horizontal — sembunyikan di desktop */
.brand-content--mobile {
  display: none;
}

.brand-logo {
  margin-bottom: 24px;
}

.brand-name {
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(1.8rem, 2.4vw, 2.6rem);
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1.15;
  color: #ffffff;
}
.brand-sub {
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #bcc5cc;
  margin-top: 6px;
}
.brand-divider {
  width: 48px;
  height: 3px;
  border-radius: 99px;
  background: #2f9d94;
  margin: 28px 0;
}
.brand-tagline {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(247, 246, 242, 0.8);
  max-width: 340px;
}
.brand-features {
  list-style: none;
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 0.9rem;
  color: rgba(247, 246, 242, 0.75);
}
.feat-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2f9d94;
  margin-right: 10px;
  vertical-align: middle;
}
.brand-footer-text {
  position: relative;
  z-index: 1;
  font-size: 0.78rem;
  color: rgba(247, 246, 242, 0.4);
}

/* ─────────────────────────────────────────
   Form Panel
───────────────────────────────────────── */
.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background: #f7f6f2;
  overflow-y: auto; /* kalau layar sangat kecil, form bisa scroll di dalam panel */
}

.card {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border-radius: 22px;
  box-shadow: 0 8px 40px rgba(6, 49, 84, 0.13);
  padding: 40px 44px 36px;
  border: 1px solid rgba(188, 197, 204, 0.3);
}

.card-header {
  margin-bottom: 28px;
}
.card-title {
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(1.5rem, 2.2vw, 1.9rem);
  font-weight: 700;
  color: #063154;
  letter-spacing: -0.3px;
}
.card-desc {
  margin-top: 8px;
  font-size: 0.88rem;
  color: #6b7c8a;
  line-height: 1.5;
}

/* ── Alerts ── */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.86rem;
  line-height: 1.45;
  margin-bottom: 20px;
}
.alert--error {
  background: #fdf2f2;
  color: #c0392b;
  border: 1px solid #f5c6c6;
}
.alert--success {
  background: #effaf5;
  color: #1a7f4f;
  border: 1px solid #a8e6c5;
}
.alert svg {
  flex-shrink: 0;
  margin-top: 1px;
}

/* ── Form ── */
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.label {
  font-size: 0.84rem;
  font-weight: 600;
  color: #063154;
  letter-spacing: 0.01em;
}
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute;
  left: 14px;
  color: #bcc5cc;
  display: flex;
  pointer-events: none;
  transition: color 0.22s;
}
.input {
  width: 100%;
  height: 48px;
  padding: 0 14px 0 44px;
  border: 1.8px solid #bcc5cc;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.92rem;
  color: #063154;
  background: #f7f6f2;
  outline: none;
  transition:
    border-color 0.22s,
    box-shadow 0.22s,
    background 0.22s;
}
.input--pad-right {
  padding-right: 44px;
}
.input::placeholder {
  color: #bcc5cc;
}
.input:focus {
  border-color: #2f9d94;
  box-shadow: 0 0 0 3px rgba(47, 157, 148, 0.16);
  background: #ffffff;
}
.input-wrap:focus-within .input-icon {
  color: #2f9d94;
}
.input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-pass {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  cursor: pointer;
  color: #bcc5cc;
  display: flex;
  padding: 2px;
  transition: color 0.22s;
}
.toggle-pass:hover {
  color: #025f67;
}

.btn-login {
  margin-top: 6px;
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #2f9d94 0%, #025f67 100%);
  color: #ffffff;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(47, 157, 148, 0.38);
  transition:
    opacity 0.22s,
    transform 0.22s,
    box-shadow 0.22s;
}
.btn-login:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
  box-shadow: 0 6px 22px rgba(47, 157, 148, 0.46);
}
.btn-login:active:not(:disabled) {
  transform: translateY(0);
  opacity: 1;
}
.btn-login:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.spinner-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.card-note {
  margin-top: 24px;
  font-size: 0.78rem;
  color: #98a9b3;
  text-align: center;
  line-height: 1.5;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.25s,
    transform 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ─────────────────────────────────────────
   RESPONSIVE
───────────────────────────────────────── */

/* Laptop medium */
@media (max-width: 1280px) {
  .brand-panel {
    width: 44%;
    padding: 48px 40px;
  }
  .card {
    padding: 44px 38px 36px;
  }
}

/* Laptop small */
@media (max-width: 1023px) {
  .brand-panel {
    width: 40%;
    padding: 40px 32px;
  }
  .brand-name {
    font-size: 1.7rem;
  }
  .card {
    max-width: 400px;
    padding: 40px 32px 32px;
  }
}

/* ── Tablet & Mobile: brand panel jadi header atas ── */
@media (max-width: 767px) {
  .page {
    flex-direction: column;
  }

  .brand-panel {
    width: 100%;
    height: auto; /* tinggi mengikuti konten header */
    padding: 16px 24px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .shape1 {
    width: 180px;
    height: 180px;
    top: -60px;
    right: -60px;
  }
  .shape2 {
    display: none;
  }

  .brand-content--desktop {
    display: none;
  }
  .brand-content--mobile {
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    z-index: 1;
  }
  .brand-content--mobile .brand-name {
    font-size: 1.1rem;
    letter-spacing: -0.2px;
  }
  .brand-content--mobile .brand-sub {
    font-size: 0.68rem;
    margin-top: 2px;
  }

  .brand-footer-text {
    position: relative;
    z-index: 1;
    font-size: 0.72rem;
    color: rgba(247, 246, 242, 0.5);
    white-space: nowrap;
  }

  /* Form panel mengisi tepat sisa tinggi layar setelah header */
  .form-panel {
    flex: 1;
    align-items: center; /* tetap center vertikal */
    padding: 20px 20px;
  }
  .card {
    max-width: 100%;
    border-radius: 14px;
    padding: 28px 24px 24px;
    box-shadow: 0 4px 24px rgba(6, 49, 84, 0.1);
  }
  .card-header {
    margin-bottom: 20px;
  }
  .form {
    gap: 16px;
  }
}

/* Mobile kecil */
@media (max-width: 480px) {
  .brand-panel {
    padding: 12px 16px;
  }
  .brand-content--mobile .brand-name {
    font-size: 1rem;
  }
  .brand-content--mobile .brand-sub {
    display: none;
  }
  .brand-footer-text {
    display: none;
  }

  .form-panel {
    padding: 16px 14px;
  }
  .card {
    padding: 22px 18px 20px;
    border-radius: 10px;
  }
  .card-title {
    font-size: 1.25rem;
  }
  .card-desc {
    font-size: 0.82rem;
  }
  .card-header {
    margin-bottom: 16px;
  }
  .form {
    gap: 14px;
  }
  .input {
    height: 44px;
    font-size: 0.88rem;
  }
  .btn-login {
    height: 44px;
    font-size: 0.9rem;
    margin-top: 4px;
  }
  .card-note {
    margin-top: 16px;
    font-size: 0.74rem;
  }
}
</style>
