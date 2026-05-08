# Session Management System - Quick Summary

## ✅ Sudah Selesai

### 1. Core Session Manager (`src/lib/sessionManager.js`)
- ✅ Password verification via Supabase RPC
- ✅ Per-posyandu session tracking
- ✅ 30-minute idle timeout dengan auto-lock
- ✅ Activity detection (click, keydown, mousemove, scroll, touch)
- ✅ Activity debounce (setiap 5 detik)
- ✅ Session state management

### 2. Pinia Store (`src/stores/sessionStore.js`)
- ✅ Global session state management
- ✅ Unlock/lock session actions
- ✅ Automatic expiration callback
- ✅ Countdown timer untuk display
- ✅ Session validation check

### 3. Composable (`src/composables/useSessionManagement.js`)
- ✅ Helper functions untuk component
- ✅ Easy integration pattern
- ✅ Reusable di semua halaman

### 4. DataBalita.vue Integration
- ✅ Updated untuk menggunakan session store
- ✅ Password gate dengan session manager
- ✅ Session expired modal
- ✅ Auto-lock after 30 minutes idle

## 🎯 Fitur yang Sudah Ada

### User Experience
```
Login ke Posyandu → (user masukkan password)
↓
Unlock selama 30 menit
↓
Berpindah halaman (Data Balita → Hasil Penimbangan) → Tidak perlu password lagi
↓
Setelah 30 menit idle → Auto-lock
↓
Modal: "Waktu habis, silahkan masukkan password lagi"
```

### Session Activation Events
- Saat password berhasil diverifikasi
- Countdown timer mulai jalan
- Activity listener aktif

### Session Expiration
- Automatic after 30 minutes idle
- Modal notification
- Data halaman di-clear
- User harus login ulang

## 📝 Cara Implementasi di Halaman Lain

### Copy-Paste Quick Template

#### Script Setup (untuk HasilPenimbangan.vue, KlasifikasiBalita.vue, LaporanBulanan.vue)

```javascript
import { useSessionStore } from '@/stores/sessionStore'

const sessionStore = useSessionStore()

// Password gate states
const pwInput = ref('')
const showPw = ref(false)
const pwError = ref('')
const pwLoading = ref(false)
const pwInputRef = ref(null)
const showSessionExpiredModal = ref(false)

// Check unlock status
const isUnlocked = computed(() => {
  return sessionStore.isSessionUnlocked(props.activePosyanduId)
})

// Watch session expired
watch(() => sessionStore.sessionExpiredPosyanduId, (expiredId) => {
  if (expiredId === props.activePosyanduId) {
    showSessionExpiredModal.value = true
    // CLEAR DATA HALAMAN DI SINI
  }
})

// Password submission
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
      // FETCH DATA HALAMAN DI SINI
      showToast('Akses diberikan selama 30 menit', 'success')
    } else {
      pwError.value = 'Password salah. Silakan coba lagi.'
      pwInput.value = ''
      nextTick(() => pwInputRef.value?.focus())
    }
  } catch (err) {
    pwError.value = err.message || 'Gagal memverifikasi password'
  } finally {
    pwLoading.value = false
  }
}

// Lock page
function lockPage() {
  if (props.activePosyanduId) {
    sessionStore.lockSession(props.activePosyanduId)
    // CLEAR DATA DI SINI
  }
}

// Close expired modal
function closeSessionExpiredModal() {
  showSessionExpiredModal.value = false
  sessionStore.resetSessionExpired()
}
```

#### Template (copy dari DataBalita.vue)
1. Password gate section (sebelum content)
2. Session expired modal (di teleport)

## 🚀 Next Steps

1. **Update HasilPenimbangan.vue** dengan template di atas
2. **Update KlasifikasiBalita.vue** dengan template di atas
3. **Update LaporanBulanan.vue** dengan template di atas
4. **Test session timeout** dengan development duration 2-5 menit untuk testing cepat

## 📊 File Struktur

```
src/
├── lib/
│   └── sessionManager.js          ← Core session logic
├── stores/
│   └── sessionStore.js            ← Pinia global state
├── composables/
│   └── useSessionManagement.js    ← Helper composable
└── views/
    ├── DataBalita.vue             ← ✅ Already updated
    ├── HasilPenimbangan.vue       ← TODO
    ├── KlasifikasiBalita.vue      ← TODO
    └── LaporanBulanan.vue         ← TODO
```

## ⚙️ Configuration

Untuk ubah session duration, edit `sessionManager.js`:

```javascript
// Default: 30 menit
const SESSION_DURATION = 30 * 60 * 1000

// Testing: 2 menit
const SESSION_DURATION = 2 * 60 * 1000
```

## ✨ Bonus Features (Optional)

### 1. Show countdown timer
```javascript
const timeLeft = computed(() => sessionStore.timeLeftDisplay)
```

### 2. Warning saat session hampir habis (< 5 menit)
```javascript
import { isSessionExpiringSoon } from '@/lib/sessionManager'

const showWarning = computed(() => {
  return isUnlocked.value && isSessionExpiringSoon(props.activePosyanduId)
})
```

### 3. Auto-extend session
```javascript
function extendSession() {
  sessionStore.startCountdownTimer(props.activePosyanduId)
}
```

## 📚 Documentation
- Lihat: `SESSION_INTEGRATION_GUIDE.md` untuk detail lengkap
- Lihat: `DataBalita.vue` untuk complete working example
